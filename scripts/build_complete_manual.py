"""Build the complete portfolio manual as polished DOCX and PDF artifacts.

The source is intentionally the checked-in Markdown manual.  This builder keeps
the source wording intact while translating its structure into native Word and
ReportLab constructs.  It requires only python-docx and ReportLab.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from html import escape as xml_escape
import os
from pathlib import Path
import re
from typing import Iterable, Sequence

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.shared import Inches, Pt, RGBColor

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "docs" / "portfolio-labs-complete-manual.md"
OUTPUT_DIR = ROOT / "docs" / "generated"
DOCX_PATH = OUTPUT_DIR / "portfolio_labs_complete_manual.docx"
PDF_PATH = OUTPUT_DIR / "portfolio_labs_complete_manual.pdf"

# Branded compact-reference palette.  The role names stay stable across DOCX
# and PDF even though their rendering APIs differ.
BONE = "FFFFFF"
BONE_DARK = "F2F5F8"
INK = "171717"
FOREST = "223E56"
FOREST_DARK = "000000"
ORANGE = "000000"
MUTED = "4A4A4A"
WHITE = "FFFFFF"

INLINE_RE = re.compile(
    r"(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|https?://[^\s<>]+)"
)
HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*$")
LIST_RE = re.compile(r"^(\s*)([-+*]|\d+\.)\s+(.+?)\s*$")
TABLE_RULE_RE = re.compile(r"^:?-{3,}:?$")


def _heading_text(text: str) -> str:
    """Use plain, punctuation-free publication headings without changing IDs."""
    text = text.replace("&", " and ").replace("+", " and ")
    text = re.sub(r"[\u2010-\u2015/-]", " ", text)
    return " ".join(re.sub(r"[^\w\s]", "", text).split())


@dataclass(slots=True)
class Block:
    kind: str
    text: str = ""
    level: int = 0
    language: str = ""
    items: list[tuple[int, str]] = field(default_factory=list)
    ordered: bool = False
    headers: list[str] = field(default_factory=list)
    rows: list[list[str]] = field(default_factory=list)


def _split_table_row(line: str) -> list[str]:
    stripped = line.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:]
    if stripped.endswith("|"):
        stripped = stripped[:-1]
    return [cell.strip() for cell in stripped.split("|")]


def _is_table_rule(line: str) -> bool:
    cells = _split_table_row(line)
    return bool(cells) and all(TABLE_RULE_RE.fullmatch(cell) for cell in cells)


def _starts_block(lines: Sequence[str], index: int) -> bool:
    line = lines[index]
    if not line.strip():
        return True
    if line.startswith("```") or HEADING_RE.match(line) or LIST_RE.match(line):
        return True
    if line.lstrip().startswith(">"):
        return True
    return index + 1 < len(lines) and "|" in line and _is_table_rule(lines[index + 1])


def parse_markdown(text: str) -> list[Block]:
    """Parse the manual's deliberately bounded Markdown subset."""

    text = re.sub(r"[\u2010-\u2015]", "-", text)
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    blocks: list[Block] = []
    index = 0

    while index < len(lines):
        line = lines[index]
        if not line.strip():
            index += 1
            continue

        if line.startswith("```"):
            language = line[3:].strip()
            index += 1
            code_lines: list[str] = []
            while index < len(lines) and not lines[index].startswith("```"):
                code_lines.append(lines[index])
                index += 1
            if index < len(lines):
                index += 1
            blocks.append(Block("code", text="\n".join(code_lines), language=language))
            continue

        heading = HEADING_RE.match(line)
        if heading:
            blocks.append(Block("heading", text=heading.group(2), level=len(heading.group(1))))
            index += 1
            continue

        if index + 1 < len(lines) and "|" in line and _is_table_rule(lines[index + 1]):
            headers = _split_table_row(line)
            index += 2
            rows: list[list[str]] = []
            while index < len(lines) and lines[index].strip() and "|" in lines[index]:
                row = _split_table_row(lines[index])
                if len(row) != len(headers):
                    break
                rows.append(row)
                index += 1
            blocks.append(Block("table", headers=headers, rows=rows))
            continue

        list_match = LIST_RE.match(line)
        if list_match:
            ordered = list_match.group(2).endswith(".") and list_match.group(2)[0].isdigit()
            items: list[tuple[int, str]] = []
            while index < len(lines):
                match = LIST_RE.match(lines[index])
                if not match:
                    break
                this_ordered = match.group(2).endswith(".") and match.group(2)[0].isdigit()
                if this_ordered != ordered:
                    break
                indent = len(match.group(1).replace("\t", "    ")) // 2
                items.append((indent, match.group(3)))
                index += 1
            blocks.append(Block("list", items=items, ordered=ordered))
            continue

        if line.lstrip().startswith(">"):
            quote_lines: list[str] = []
            while index < len(lines) and lines[index].lstrip().startswith(">"):
                quote_lines.append(lines[index].lstrip()[1:].lstrip())
                index += 1
            blocks.append(Block("quote", text=" ".join(quote_lines)))
            continue

        paragraph_lines = [line.strip()]
        index += 1
        while index < len(lines) and not _starts_block(lines, index):
            paragraph_lines.append(lines[index].strip())
            index += 1
        paragraph_text = " ".join(paragraph_lines)
        if re.fullmatch(r"\*\*[^*]{1,140}\*\*", paragraph_text):
            blocks.append(Block("heading", text=paragraph_text[2:-2], level=4))
        else:
            blocks.append(Block("paragraph", text=paragraph_text))

    return blocks


def _hex_rgb(value: str) -> RGBColor:
    return RGBColor.from_string(value)


def _set_run_font(run, name: str, size: float | None = None) -> None:
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    if size is not None:
        run.font.size = Pt(size)


def _set_cell_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def _set_paragraph_shading(paragraph, fill: str) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    shd = p_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        p_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def _set_paragraph_border(paragraph, side: str, color: str, size: int = 14, space: int = 7) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    borders = p_pr.find(qn("w:pBdr"))
    if borders is None:
        borders = OxmlElement("w:pBdr")
        p_pr.append(borders)
    border = borders.find(qn(f"w:{side}"))
    if border is None:
        border = OxmlElement(f"w:{side}")
        borders.append(border)
    border.set(qn("w:val"), "single")
    border.set(qn("w:sz"), str(size))
    border.set(qn("w:space"), str(space))
    border.set(qn("w:color"), color)


def _set_cell_margins(cell, top: int = 80, start: int = 120, bottom: int = 80, end: int = 120) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.find(qn("w:tcMar"))
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{name}"))
        if node is None:
            node = OxmlElement(f"w:{name}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def _set_repeat_table_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    marker = OxmlElement("w:tblHeader")
    marker.set(qn("w:val"), "true")
    tr_pr.append(marker)


def _set_table_geometry(table, widths_dxa: Sequence[int]) -> None:
    total = sum(widths_dxa)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr

    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(total))
    tbl_w.set(qn("w:type"), "dxa")

    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")

    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tbl_pr.append(layout)
    layout.set(qn("w:type"), "fixed")

    borders = OxmlElement("w:tblBorders")
    for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
        border = OxmlElement(f"w:{side}")
        border.set(qn("w:val"), "single")
        border.set(qn("w:sz"), "4")
        border.set(qn("w:color"), "D9D9D9")
        borders.append(border)
    tbl_pr.append(borders)

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        grid_col = OxmlElement("w:gridCol")
        grid_col.set(qn("w:w"), str(width))
        grid.append(grid_col)

    for row in table.rows:
        for index, cell in enumerate(row.cells):
            width = widths_dxa[min(index, len(widths_dxa) - 1)]
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(width))
            tc_w.set(qn("w:type"), "dxa")
            _set_cell_margins(cell)


def _table_widths(headers: Sequence[str]) -> list[int]:
    if len(headers) == 5 and headers[0].strip() == "#":
        return [480, 1600, 2000, 2300, 2980]
    if len(headers) == 4:
        return [1500, 2200, 2200, 3460]
    if len(headers) == 3:
        return [1800, 3000, 4560]
    if len(headers) == 2:
        return [2600, 6760]
    count = max(1, len(headers))
    widths = [9360 // count] * count
    widths[-1] += 9360 - sum(widths)
    return widths


def _add_word_field(paragraph, instruction: str) -> None:
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    field_code = OxmlElement("w:instrText")
    field_code.set(qn("xml:space"), "preserve")
    field_code.text = f" {instruction} "
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:t")
    placeholder.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    for element in (begin, field_code, separate, placeholder, end):
        run._r.append(element)


def _add_docx_hyperlink(paragraph, label: str, url: str) -> None:
    relationship_id = paragraph.part.relate_to(url, RT.HYPERLINK, is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), relationship_id)
    run = OxmlElement("w:r")
    run_properties = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), FOREST)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    run_properties.extend((color, underline))
    text = OxmlElement("w:t")
    text.text = label
    run.extend((run_properties, text))
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def _trim_url_punctuation(token: str) -> tuple[str, str]:
    suffix = ""
    while token and token[-1] in ".,;:":
        suffix = token[-1] + suffix
        token = token[:-1]
    return token, suffix


def _add_inline_docx(paragraph, text: str, *, base_font: str = "Calibri", base_size: float = 11) -> None:
    cursor = 0
    for match in INLINE_RE.finditer(text):
        if match.start() > cursor:
            run = paragraph.add_run(text[cursor : match.start()])
            _set_run_font(run, base_font, base_size)

        token = match.group(0)
        if token.startswith("**"):
            run = paragraph.add_run(token[2:-2])
            _set_run_font(run, base_font, base_size)
            run.bold = True
        elif token.startswith("`"):
            run = paragraph.add_run(token[1:-1])
            _set_run_font(run, "Consolas", base_size - 0.5)
            run.font.color.rgb = _hex_rgb(FOREST_DARK)
            run.font.highlight_color = None
        elif token.startswith("["):
            close = token.rfind("](")
            _add_docx_hyperlink(paragraph, token[1:close], token[close + 2 : -1])
        elif token.startswith("*"):
            run = paragraph.add_run(token[1:-1])
            _set_run_font(run, base_font, base_size)
            run.italic = True
        else:
            url, suffix = _trim_url_punctuation(token)
            _add_docx_hyperlink(paragraph, url, url)
            if suffix:
                run = paragraph.add_run(suffix)
                _set_run_font(run, base_font, base_size)
        cursor = match.end()

    if cursor < len(text):
        run = paragraph.add_run(text[cursor:])
        _set_run_font(run, base_font, base_size)


def _add_or_get_style(document: Document, name: str, style_type=WD_STYLE_TYPE.PARAGRAPH):
    try:
        return document.styles[name]
    except KeyError:
        return document.styles.add_style(name, style_type)


def _configure_docx_styles(document: Document) -> None:
    styles = document.styles

    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)
    normal.font.color.rgb = _hex_rgb(INK)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25

    title = styles["Title"]
    title.font.name = "Georgia"
    title.font.size = Pt(30)
    title.font.bold = True
    title.font.color.rgb = _hex_rgb(FOREST_DARK)
    title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_before = Pt(12)
    title.paragraph_format.space_after = Pt(24)
    title.paragraph_format.keep_with_next = True

    heading_1 = styles["Heading 1"]
    heading_1.font.name = "Calibri"
    heading_1.font.size = Pt(16)
    heading_1.font.bold = True
    heading_1.font.color.rgb = _hex_rgb("000000")
    heading_1.paragraph_format.space_before = Pt(18)
    heading_1.paragraph_format.space_after = Pt(10)
    heading_1.paragraph_format.line_spacing = 1.05
    heading_1.paragraph_format.keep_with_next = True
    heading_1.paragraph_format.page_break_before = False

    heading_2 = styles["Heading 2"]
    heading_2.font.name = "Calibri"
    heading_2.font.size = Pt(13)
    heading_2.font.bold = True
    heading_2.font.color.rgb = _hex_rgb(ORANGE)
    heading_2.paragraph_format.space_before = Pt(14)
    heading_2.paragraph_format.space_after = Pt(7)
    heading_2.paragraph_format.line_spacing = 1.08
    heading_2.paragraph_format.keep_with_next = True

    heading_3 = styles["Heading 3"]
    heading_3.font.name = "Calibri"
    heading_3.font.size = Pt(12)
    heading_3.font.bold = True
    heading_3.font.color.rgb = _hex_rgb(FOREST_DARK)
    heading_3.paragraph_format.space_before = Pt(10)
    heading_3.paragraph_format.space_after = Pt(5)
    heading_3.paragraph_format.keep_with_next = True

    for style_name in ("List Bullet", "List Number"):
        style = styles[style_name]
        style.font.name = "Calibri"
        style.font.size = Pt(11)
        style.font.color.rgb = _hex_rgb(INK)
        style.paragraph_format.space_before = Pt(0)
        style.paragraph_format.space_after = Pt(4)
        style.paragraph_format.line_spacing = 1.25

    cover_meta = _add_or_get_style(document, "Cover Metadata")
    cover_meta.base_style = normal
    cover_meta.font.name = "Calibri"
    cover_meta.font.size = Pt(10.5)
    cover_meta.font.color.rgb = _hex_rgb(MUTED)
    cover_meta.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    cover_meta.paragraph_format.left_indent = Inches(0)
    cover_meta.paragraph_format.right_indent = Inches(0)
    cover_meta.paragraph_format.space_after = Pt(7)
    cover_meta.paragraph_format.line_spacing = 1.18

    code = _add_or_get_style(document, "Code Block")
    code.base_style = normal
    code.font.name = "Consolas"
    code.font.size = Pt(8.5)
    code.font.color.rgb = _hex_rgb(FOREST_DARK)
    code.paragraph_format.left_indent = Inches(0.18)
    code.paragraph_format.right_indent = Inches(0.18)
    code.paragraph_format.space_before = Pt(0)
    code.paragraph_format.space_after = Pt(0)
    code.paragraph_format.line_spacing = 1.05

    quote = _add_or_get_style(document, "Editorial Quote")
    quote.base_style = normal
    quote.font.name = "Georgia"
    quote.font.size = Pt(11)
    quote.font.italic = True
    quote.font.color.rgb = _hex_rgb(FOREST_DARK)
    quote.paragraph_format.left_indent = Inches(0.32)
    quote.paragraph_format.right_indent = Inches(0.20)
    quote.paragraph_format.space_before = Pt(8)
    quote.paragraph_format.space_after = Pt(10)
    quote.paragraph_format.line_spacing = 1.25

    table_row = _add_or_get_style(document, "Reference Row")
    table_row.base_style = normal
    table_row.font.name = "Calibri"
    table_row.font.size = Pt(9.5)
    table_row.font.color.rgb = _hex_rgb(INK)
    table_row.paragraph_format.left_indent = Inches(0.12)
    table_row.paragraph_format.right_indent = Inches(0.08)
    table_row.paragraph_format.space_before = Pt(2)
    table_row.paragraph_format.space_after = Pt(2)
    table_row.paragraph_format.line_spacing = 1.12

    table_text = _add_or_get_style(document, "Appendix Table Text")
    table_text.base_style = normal
    table_text.font.name = "Calibri"
    table_text.font.size = Pt(8)
    table_text.font.color.rgb = _hex_rgb(INK)
    table_text.paragraph_format.space_before = Pt(0)
    table_text.paragraph_format.space_after = Pt(0)
    table_text.paragraph_format.line_spacing = 1.05


def _next_numbering_id(numbering, tag: str) -> int:
    values = []
    for element in numbering.findall(qn(tag)):
        attribute = "w:abstractNumId" if tag == "w:abstractNum" else "w:numId"
        raw = element.get(qn(attribute))
        if raw is not None and raw.isdigit():
            values.append(int(raw))
    return max(values, default=0) + 1


def _create_numbering(document: Document, ordered: bool) -> int:
    numbering = document.part.numbering_part.element
    abstract_id = _next_numbering_id(numbering, "w:abstractNum")
    num_id = _next_numbering_id(numbering, "w:num")

    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(abstract_id))
    multi_level = OxmlElement("w:multiLevelType")
    multi_level.set(qn("w:val"), "multilevel")
    abstract.append(multi_level)

    for level in range(0, 4):
        lvl = OxmlElement("w:lvl")
        lvl.set(qn("w:ilvl"), str(level))
        start = OxmlElement("w:start")
        start.set(qn("w:val"), "1")
        num_fmt = OxmlElement("w:numFmt")
        num_fmt.set(qn("w:val"), "decimal" if ordered else "bullet")
        lvl_text = OxmlElement("w:lvlText")
        lvl_text.set(qn("w:val"), f"%{level + 1}." if ordered else "•")
        justification = OxmlElement("w:lvlJc")
        justification.set(qn("w:val"), "left")
        p_pr = OxmlElement("w:pPr")
        tabs = OxmlElement("w:tabs")
        tab = OxmlElement("w:tab")
        tab.set(qn("w:val"), "num")
        position = 540 + level * 360
        tab.set(qn("w:pos"), str(position))
        tabs.append(tab)
        indent = OxmlElement("w:ind")
        indent.set(qn("w:left"), str(position))
        indent.set(qn("w:hanging"), "270")
        spacing = OxmlElement("w:spacing")
        spacing.set(qn("w:after"), "80")
        spacing.set(qn("w:line"), "300")
        spacing.set(qn("w:lineRule"), "auto")
        p_pr.extend((tabs, indent, spacing))
        lvl.extend((start, num_fmt, lvl_text, justification, p_pr))
        if not ordered:
            r_pr = OxmlElement("w:rPr")
            r_fonts = OxmlElement("w:rFonts")
            r_fonts.set(qn("w:ascii"), "Calibri")
            r_fonts.set(qn("w:hAnsi"), "Calibri")
            r_pr.append(r_fonts)
            lvl.append(r_pr)
        abstract.append(lvl)

    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id))
    abstract_ref = OxmlElement("w:abstractNumId")
    abstract_ref.set(qn("w:val"), str(abstract_id))
    num.append(abstract_ref)
    first_num = numbering.find(qn("w:num"))
    if first_num is None:
        numbering.append(abstract)
    else:
        numbering.insert(list(numbering).index(first_num), abstract)
    numbering.append(num)
    return num_id


def _apply_numbering(paragraph, num_id: int, level: int) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    num_pr = p_pr.find(qn("w:numPr"))
    if num_pr is None:
        num_pr = OxmlElement("w:numPr")
        p_pr.append(num_pr)
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), str(min(level, 3)))
    num = OxmlElement("w:numId")
    num.set(qn("w:val"), str(num_id))
    num_pr.extend((ilvl, num))


def _configure_docx_page(document: Document) -> None:
    section = document.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.right_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)
    section.different_first_page_header_footer = True

    header = section.header
    paragraph = header.paragraphs[0]
    paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
    paragraph.paragraph_format.space_after = Pt(0)
    run = paragraph.add_run("PORTFOLIO + APPLIED LABS  /  COMPLETE PROJECT MANUAL")
    _set_run_font(run, "Calibri", 8)
    run.bold = True
    run.font.color.rgb = _hex_rgb("000000")

    footer = section.footer
    paragraph = footer.paragraphs[0]
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    paragraph.paragraph_format.space_before = Pt(0)
    run = paragraph.add_run("Deepan Karthick | Page ")
    _set_run_font(run, "Calibri", 8)
    run.font.color.rgb = _hex_rgb(MUTED)
    _add_word_field(paragraph, "PAGE")
    run = paragraph.add_run(" / ")
    _set_run_font(run, "Calibri", 8)
    run.font.color.rgb = _hex_rgb(MUTED)
    _add_word_field(paragraph, "NUMPAGES")

    update_fields = document.settings.element.find(qn("w:updateFields"))
    if update_fields is None:
        update_fields = OxmlElement("w:updateFields")
        document.settings.element.append(update_fields)
    update_fields.set(qn("w:val"), "true")
    background = OxmlElement("w:background")
    background.set(qn("w:color"), BONE)
    document._element.insert(0, background)
    display_background = OxmlElement("w:displayBackgroundShape")
    document.settings.element.append(display_background)


def _add_docx_code(document: Document, text: str) -> None:
    lines = text.split("\n") or [""]
    for index, line in enumerate(lines):
        paragraph = document.add_paragraph(style="Code Block")
        run = paragraph.add_run(line if line else " ")
        _set_run_font(run, "Consolas", 8.5)
        if index == 0:
            paragraph.paragraph_format.space_before = Pt(5)
        if index == len(lines) - 1:
            paragraph.paragraph_format.space_after = Pt(7)


def _add_docx_linear_table(document: Document, block: Block) -> None:
    header = document.add_paragraph(style="Reference Row")
    _set_paragraph_shading(header, FOREST)
    for index, value in enumerate(block.headers):
        if index:
            separator = header.add_run("  |  ")
            _set_run_font(separator, "Calibri", 9)
            separator.font.color.rgb = _hex_rgb(BONE)
        run = header.add_run(value)
        _set_run_font(run, "Calibri", 9)
        run.bold = True
        run.font.color.rgb = _hex_rgb(WHITE)
    for row_index, row in enumerate(block.rows):
        paragraph = document.add_paragraph(style="Reference Row")
        _set_paragraph_shading(paragraph, BONE_DARK if row_index % 2 == 0 else BONE)
        _add_inline_docx(paragraph, "  |  ".join(row), base_size=9.5)


def _add_docx_appendix_table(document: Document, block: Block) -> None:
    data = [block.headers, *block.rows]
    table = document.add_table(rows=len(data), cols=len(block.headers))
    table.style = "Table Grid"
    widths = _table_widths(block.headers)
    _set_table_geometry(table, widths)
    _set_repeat_table_header(table.rows[0])

    for row_index, row in enumerate(data):
        for column_index, value in enumerate(row):
            cell = table.cell(row_index, column_index)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            _set_cell_shading(cell, FOREST if row_index == 0 else (BONE_DARK if row_index % 2 else BONE))
            paragraph = cell.paragraphs[0]
            paragraph.style = document.styles["Appendix Table Text"]
            if column_index == 0 and block.headers[0].strip() in {"#", "Batch", "ID"}:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            if row_index == 0:
                run = paragraph.add_run(value)
                _set_run_font(run, "Calibri", 8)
                run.bold = True
                run.font.color.rgb = _hex_rgb(WHITE)
            else:
                _add_inline_docx(paragraph, value, base_size=8)


def build_docx(blocks: Sequence[Block], output_path: Path) -> None:
    document = Document()
    _configure_docx_page(document)
    _configure_docx_styles(document)
    document.core_properties.title = "Portfolio and Applied Labs Complete Project Manual"
    document.core_properties.subject = "Two flagships and thirty certificate-linked applied labs"
    document.core_properties.author = "Deepan Karthick"
    document.core_properties.keywords = "portfolio, applied labs, Timber CFT, printing ERP"

    bullet_num_id = _create_numbering(document, ordered=False)
    on_cover = True
    appendix_context = False

    for block in blocks:
        if block.kind == "heading":
            if block.level == 1:
                paragraph = document.add_paragraph(style="Title")
                _add_inline_docx(paragraph, _heading_text(block.text), base_font="Georgia", base_size=30)
            elif block.level == 2:
                on_cover = False
                appendix_context = False
                paragraph = document.add_paragraph(style="Heading 1")
                _add_inline_docx(paragraph, _heading_text(block.text), base_size=16)
            elif block.level == 3:
                appendix_context = block.text.startswith("Appendix ")
                paragraph = document.add_paragraph(style="Heading 2")
                _add_inline_docx(paragraph, _heading_text(block.text), base_size=13)
            else:
                paragraph = document.add_paragraph(style="Heading 3")
                _add_inline_docx(paragraph, _heading_text(block.text), base_size=12)
            continue

        if block.kind == "paragraph":
            style = "Cover Metadata" if on_cover else "Normal"
            paragraph = document.add_paragraph(style=style)
            _add_inline_docx(paragraph, block.text, base_size=10.5 if on_cover else 11)
            continue

        if block.kind == "quote":
            paragraph = document.add_paragraph(style="Editorial Quote")
            _add_inline_docx(paragraph, block.text, base_font="Georgia", base_size=11)
            continue

        if block.kind == "list":
            num_id = _create_numbering(document, ordered=True) if block.ordered else bullet_num_id
            style = "List Number" if block.ordered else "List Bullet"
            for level, item in block.items:
                paragraph = document.add_paragraph(style=style)
                _apply_numbering(paragraph, num_id, level)
                _add_inline_docx(paragraph, item)
            continue

        if block.kind == "code":
            _add_docx_code(document, block.text)
            continue

        if block.kind == "table":
            _add_docx_appendix_table(document, block)
            document.add_paragraph().paragraph_format.space_after = Pt(3)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    document.save(output_path)


def _font_candidates(filename: str) -> Iterable[Path]:
    windir = Path(os.environ.get("WINDIR", "C:/Windows"))
    yield windir / "Fonts" / filename
    yield Path("/usr/share/fonts/truetype/dejavu") / filename
    yield Path("/usr/local/share/fonts") / filename


def _first_existing(*filenames: str) -> Path | None:
    for filename in filenames:
        for path in _font_candidates(filename):
            if path.exists():
                return path
    return None


def _register_pdf_fonts() -> dict[str, str]:
    variants = {
        "GuideSans": ("calibri.ttf", "arial.ttf", "DejaVuSans.ttf"),
        "GuideSans-Bold": ("calibrib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"),
        "GuideSans-Italic": ("calibrii.ttf", "ariali.ttf", "DejaVuSans-Oblique.ttf"),
        "GuideSans-BoldItalic": ("calibriz.ttf", "arialbi.ttf", "DejaVuSans-BoldOblique.ttf"),
        "GuideSerif": ("georgia.ttf", "times.ttf", "DejaVuSerif.ttf"),
        "GuideSerif-Bold": ("georgiab.ttf", "timesbd.ttf", "DejaVuSerif-Bold.ttf"),
        "GuideMono": ("consola.ttf", "cour.ttf", "DejaVuSansMono.ttf"),
    }
    registered: dict[str, str] = {}
    for internal_name, filenames in variants.items():
        path = _first_existing(*filenames)
        if path is not None:
            pdfmetrics.registerFont(TTFont(internal_name, str(path)))
            registered[internal_name] = internal_name

    sans = registered.get("GuideSans", "Helvetica")
    bold = registered.get("GuideSans-Bold", "Helvetica-Bold")
    italic = registered.get("GuideSans-Italic", "Helvetica-Oblique")
    bold_italic = registered.get("GuideSans-BoldItalic", "Helvetica-BoldOblique")
    serif = registered.get("GuideSerif", "Times-Roman")
    serif_bold = registered.get("GuideSerif-Bold", "Times-Bold")
    mono = registered.get("GuideMono", "Courier")
    if sans.startswith("Guide"):
        pdfmetrics.registerFontFamily(
            "GuideSans",
            normal=sans,
            bold=bold,
            italic=italic,
            boldItalic=bold_italic,
        )
    return {
        "sans": sans,
        "bold": bold,
        "italic": italic,
        "bold_italic": bold_italic,
        "serif": serif,
        "serif_bold": serif_bold,
        "mono": mono,
    }


def _inline_pdf(text: str, fonts: dict[str, str]) -> str:
    parts: list[str] = []
    cursor = 0
    for match in INLINE_RE.finditer(text):
        if match.start() > cursor:
            parts.append(xml_escape(text[cursor : match.start()]))
        token = match.group(0)
        if token.startswith("**"):
            parts.append(f"<b>{xml_escape(token[2:-2])}</b>")
        elif token.startswith("`"):
            parts.append(
                f'<font name="{fonts["mono"]}" color="#{FOREST_DARK}">{xml_escape(token[1:-1])}</font>'
            )
        elif token.startswith("["):
            close = token.rfind("](")
            label = xml_escape(token[1:close])
            url = xml_escape(token[close + 2 : -1], quote=True)
            parts.append(f'<link href="{url}" color="#{FOREST}"><u>{label}</u></link>')
        elif token.startswith("*"):
            parts.append(f"<i>{xml_escape(token[1:-1])}</i>")
        else:
            url, suffix = _trim_url_punctuation(token)
            escaped_url = xml_escape(url, quote=True)
            parts.append(f'<link href="{escaped_url}" color="#{FOREST}"><u>{xml_escape(url)}</u></link>')
            parts.append(xml_escape(suffix))
        cursor = match.end()
    if cursor < len(text):
        parts.append(xml_escape(text[cursor:]))
    return "".join(parts)


def _pdf_styles(fonts: dict[str, str]) -> dict[str, ParagraphStyle]:
    return {
        "CoverTitle": ParagraphStyle(
            "CoverTitle",
            fontName=fonts["serif_bold"],
            fontSize=27,
            leading=33,
            textColor=HexColor(f"#{FOREST_DARK}"),
            alignment=TA_CENTER,
            spaceAfter=24,
        ),
        "CoverMeta": ParagraphStyle(
            "CoverMeta",
            fontName=fonts["sans"],
            fontSize=10.2,
            leading=13.2,
            textColor=HexColor(f"#{MUTED}"),
            alignment=TA_LEFT,
            spaceAfter=8,
        ),
        "Body": ParagraphStyle(
            "Body",
            fontName=fonts["sans"],
            fontSize=11,
            leading=14,
            textColor=HexColor(f"#{INK}"),
            alignment=TA_LEFT,
            spaceAfter=6,
            allowWidows=0,
            allowOrphans=0,
        ),
        "Section": ParagraphStyle(
            "Section",
            fontName=fonts["bold"],
            fontSize=16,
            leading=19,
            textColor=colors.black,
            spaceBefore=15,
            spaceAfter=10,
            keepWithNext=True,
        ),
        "Subsection": ParagraphStyle(
            "Subsection",
            fontName=fonts["bold"],
            fontSize=12.5,
            leading=15,
            textColor=HexColor(f"#{ORANGE}"),
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True,
        ),
        "Quote": ParagraphStyle(
            "Quote",
            parent=None,
            fontName=fonts["serif"],
            fontSize=10.5,
            leading=13.5,
            textColor=HexColor(f"#{FOREST_DARK}"),
            leftIndent=18,
            rightIndent=10,
            spaceBefore=7,
            spaceAfter=10,
        ),
        "Detail": ParagraphStyle(
            "Detail", fontName=fonts["bold"], fontSize=11, leading=13.5,
            textColor=colors.black, spaceBefore=9, spaceAfter=6, keepWithNext=True,
        ),
        "List": ParagraphStyle(
            "List",
            fontName=fonts["sans"],
            fontSize=10.5,
            leading=13.3,
            textColor=HexColor(f"#{INK}"),
            spaceAfter=3,
        ),
        "Code": ParagraphStyle(
            "Code",
            fontName=fonts["mono"],
            fontSize=7.7,
            leading=9.5,
            textColor=HexColor(f"#{FOREST_DARK}"),
            leftIndent=10,
            rightIndent=10,
            spaceBefore=4,
            spaceAfter=7,
        ),
        "DataHeader": ParagraphStyle(
            "DataHeader",
            fontName=fonts["bold"],
            fontSize=8.8,
            leading=11,
            textColor=colors.white,
            backColor=HexColor(f"#{FOREST}"),
            borderPadding=6,
            spaceBefore=4,
            spaceAfter=2,
        ),
        "DataRow": ParagraphStyle(
            "DataRow",
            fontName=fonts["sans"],
            fontSize=8.8,
            leading=11.2,
            textColor=HexColor(f"#{INK}"),
            backColor=HexColor(f"#{BONE_DARK}"),
            borderPadding=5,
            spaceAfter=2,
        ),
        "TableHeader": ParagraphStyle(
            "TableHeader",
            fontName=fonts["bold"],
            fontSize=8.3,
            leading=10,
            textColor=colors.white,
            alignment=TA_LEFT,
        ),
        "TableCell": ParagraphStyle(
            "TableCell",
            fontName=fonts["sans"],
            fontSize=8.1,
            leading=10,
            textColor=HexColor(f"#{INK}"),
            alignment=TA_LEFT,
        ),
    }


class ManualPdfTemplate(BaseDocTemplate):
    def afterFlowable(self, flowable) -> None:  # noqa: N802 - ReportLab API name
        if not isinstance(flowable, Paragraph):
            return
        if flowable.style.name not in {"Section", "Subsection"}:
            return
        level = 0 if flowable.style.name == "Section" else 1
        key = f"heading-{self.page}-{len(self.canv._code)}"
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(flowable.getPlainText(), key, level=level, closed=False)


def _draw_cover_page(canvas, document) -> None:
    canvas.saveState()
    width, height = LETTER
    canvas.setFillColor(HexColor(f"#{BONE}"))
    canvas.rect(0, 0, width, height, stroke=0, fill=1)
    canvas.restoreState()


def _draw_body_page(canvas, document) -> None:
    canvas.saveState()
    width, height = LETTER
    canvas.setFillColor(HexColor(f"#{BONE}"))
    canvas.rect(0, 0, width, height, stroke=0, fill=1)
    canvas.setStrokeColor(HexColor(f"#{BONE_DARK}"))
    canvas.setLineWidth(0.6)
    canvas.line(inch, height - 0.62 * inch, width - inch, height - 0.62 * inch)
    canvas.setFont(document.fonts["bold"], 7.6)
    canvas.setFillColor(colors.black)
    canvas.drawString(inch, height - 0.50 * inch, "PORTFOLIO + APPLIED LABS")
    canvas.setFont(document.fonts["sans"], 7.6)
    canvas.setFillColor(HexColor(f"#{MUTED}"))
    canvas.drawRightString(width - inch, height - 0.50 * inch, "COMPLETE PROJECT MANUAL")
    canvas.setStrokeColor(HexColor(f"#{BONE_DARK}"))
    canvas.line(inch, 0.58 * inch, width - inch, 0.58 * inch)
    canvas.setFont(document.fonts["sans"], 7.5)
    canvas.setFillColor(HexColor(f"#{MUTED}"))
    canvas.drawString(inch, 0.39 * inch, "Deepan Karthick")
    canvas.drawRightString(width - inch, 0.39 * inch, f"Page {canvas.getPageNumber()}")
    canvas.restoreState()


def _pdf_appendix_table(block: Block, styles: dict[str, ParagraphStyle], fonts: dict[str, str]) -> Table:
    data: list[list[Paragraph]] = []
    data.append([Paragraph(_inline_pdf(cell, fonts), styles["TableHeader"]) for cell in block.headers])
    for row in block.rows:
        data.append([Paragraph(_inline_pdf(cell, fonts), styles["TableCell"]) for cell in row])
    dxa_widths = _table_widths(block.headers)
    widths = [value / 1440 * inch for value in dxa_widths]
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), HexColor(f"#{FOREST}")),
                ("BACKGROUND", (0, 1), (-1, -1), HexColor(f"#{BONE}")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor(f"#{BONE}"), HexColor(f"#{BONE_DARK}")]),
                ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#D9D9D9")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def build_pdf(blocks: Sequence[Block], output_path: Path) -> None:
    fonts = _register_pdf_fonts()
    styles = _pdf_styles(fonts)
    document = ManualPdfTemplate(
        str(output_path),
        pagesize=LETTER,
        leftMargin=inch,
        rightMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
        title="Portfolio and Applied Labs Complete Project Manual",
        author="Deepan Karthick",
        subject="Two flagships and thirty certificate-linked applied labs",
        allowSplitting=1,
    )
    document.fonts = fonts
    frame = Frame(inch, inch, 6.5 * inch, 9 * inch, id="manual-body", leftPadding=0, rightPadding=0)
    document.addPageTemplates(
        [
            PageTemplate(id="Cover", frames=[frame], onPage=_draw_cover_page),
            PageTemplate(id="Body", frames=[frame], onPage=_draw_body_page),
        ]
    )

    story = []
    on_cover = True
    appendix_context = False

    for block in blocks:
        if block.kind == "heading":
            if block.level == 1:
                story.append(Spacer(1, 0.12 * inch))
                story.append(Paragraph(_inline_pdf(_heading_text(block.text), fonts), styles["CoverTitle"]))
            elif block.level == 2:
                if on_cover:
                    story.extend((NextPageTemplate("Body"), PageBreak()))
                    on_cover = False
                appendix_context = False
                story.append(Paragraph(_inline_pdf(_heading_text(block.text), fonts), styles["Section"]))
            elif block.level == 3:
                appendix_context = block.text.startswith("Appendix ")
                story.append(Paragraph(_inline_pdf(_heading_text(block.text), fonts), styles["Subsection"]))
            else:
                story.append(Paragraph(_inline_pdf(_heading_text(block.text), fonts), styles["Detail"]))
            continue

        if block.kind == "paragraph":
            style = styles["CoverMeta"] if on_cover else styles["Body"]
            story.append(Paragraph(_inline_pdf(block.text, fonts), style))
            continue

        if block.kind == "quote":
            story.append(Paragraph(_inline_pdf(block.text, fonts), styles["Quote"]))
            continue

        if block.kind == "list":
            items = []
            for level, item in block.items:
                paragraph = Paragraph(_inline_pdf(item, fonts), styles["List"])
                items.append(ListItem(paragraph, leftIndent=level * 12))
            list_options = {
                "bulletType": "1" if block.ordered else "bullet",
                "leftIndent": 27,
                "bulletFontName": fonts["sans"],
                "bulletFontSize": 8.5,
                "bulletColor": HexColor(f"#{ORANGE}"),
                "spaceAfter": 5,
            }
            if block.ordered:
                list_options["start"] = "1"
            if (
                items and story and isinstance(story[-1], Paragraph)
                and story[-1].style.name in {"Section", "Subsection", "Detail"}
            ):
                heading = story.pop()
                first_options = {**list_options, "spaceAfter": 0}
                story.append(KeepTogether([heading, ListFlowable(items[:1], **first_options)]))
                if len(items) > 1:
                    remaining_options = dict(list_options)
                    if block.ordered:
                        remaining_options["start"] = "2"
                    story.append(ListFlowable(items[1:], **remaining_options))
            else:
                story.append(ListFlowable(items, **list_options))
            continue

        if block.kind == "code":
            story.append(Preformatted(block.text or " ", styles["Code"], maxLineLength=105))
            continue

        if block.kind == "table":
            # Use a genuine splittable table for every Markdown table. Earlier
            # shaded Paragraph rows could visually clip wrapped lines because
            # paragraph padding is paint-only in ReportLab. Table cells compute
            # their wrapped height and can split safely across page frames.
            story.append(_pdf_appendix_table(block, styles, fonts))
            story.append(Spacer(1, 7))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    document.build(story)


def build_all() -> tuple[Path, Path]:
    if not SOURCE_PATH.exists():
        raise FileNotFoundError(f"Manual source not found: {SOURCE_PATH}")
    source = SOURCE_PATH.read_text(encoding="utf-8")
    blocks = parse_markdown(source)
    if not blocks or blocks[0].kind != "heading" or blocks[0].level != 1:
        raise ValueError("Manual must begin with one Markdown H1 title")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    build_docx(blocks, DOCX_PATH)
    build_pdf(blocks, PDF_PATH)
    return DOCX_PATH, PDF_PATH


def main() -> None:
    docx_path, pdf_path = build_all()
    print(docx_path)
    print(pdf_path)


if __name__ == "__main__":
    main()
