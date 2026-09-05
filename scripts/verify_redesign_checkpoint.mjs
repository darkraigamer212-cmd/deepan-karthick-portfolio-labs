// Read-only integrity checks for saved planning work, not application acceptance.
import { open, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const control = "docs/project-control/";
const failures = [];
const jpegSignature = Buffer.from([255, 216, 255]);
const jpegEndMarker = Buffer.from([255, 217]);
const captureNames = ["home-ready.jpg", "timber-actual.jpg", "erp-actual.jpg", "labs-before.jpg"];

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

async function requiredText(file) {
  try {
    const text = await readFile(new URL(file, root), "utf8");
    if (!text.trim()) fail(file, "file is empty; restore the saved planning content.");
    return text;
  } catch (error) {
    fail(file, `cannot read file (${error.code ?? error.message}); create or restore it before checkpoint sign-off.`);
    return "";
  }
}

function tableRows(text, firstCellPattern) {
  return text.split(/\r?\n/)
    .filter((line) => line.trimStart().startsWith("|"))
    .map((line) => line.trim().split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => firstCellPattern.test(cells[0] ?? ""));
}

function canonicalText(value) {
  return value.replaceAll("`", "").trim();
}

const manifestFile = `${control}project-manifest.json`;
const manifestText = await requiredText(manifestFile);
let manifest;
if (manifestText) {
  try {
    manifest = JSON.parse(manifestText);
  } catch (error) {
    fail(manifestFile, `invalid JSON (${error.message}); repair the manifest before checking coverage.`);
  }
}

const labs = Array.isArray(manifest?.labs) ? manifest.labs : [];
const flagships = Array.isArray(manifest?.flagships) ? manifest.flagships : [];
if (manifest) {
  if (manifest.credentialCount !== 30) fail(manifestFile, "credentialCount must remain 30.");
  if (labs.length !== 30) fail(manifestFile, `expected exactly 30 labs; found ${labs.length}.`);
  if (flagships.length !== 2) fail(manifestFile, `expected exactly 2 flagships; found ${flagships.length}.`);

  const ids = new Set();
  const slugs = new Set();
  for (const lab of labs) {
    if (!Number.isInteger(lab?.id) || lab.id < 1 || lab.id > 30) {
      fail(manifestFile, `invalid lab ID ${JSON.stringify(lab?.id)}; use integers 1 through 30.`);
    }
    if (ids.has(lab?.id)) fail(manifestFile, `duplicate lab ID ${lab?.id}; restore the unique canonical entry.`);
    if (typeof lab?.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lab.slug)) {
      fail(manifestFile, `lab ${lab?.id} needs a nonempty canonical kebab-case slug.`);
    }
    if (slugs.has(lab?.slug)) fail(manifestFile, `duplicate lab slug ${lab?.slug}.`);
    if (typeof lab?.project !== "string" || !lab.project.trim()) fail(manifestFile, `lab ${lab?.id} needs its canonical project name.`);
    ids.add(lab?.id);
    slugs.add(lab?.slug);
  }
  for (let id = 1; id <= 30; id += 1) {
    if (!ids.has(id)) fail(manifestFile, `missing canonical lab ID ${id}.`);
  }
  const flagshipIds = new Set();
  for (const flagship of flagships) {
    if (!flagship?.id || !flagship?.name) fail(manifestFile, "each flagship needs its canonical ID and name.");
    if (flagshipIds.has(flagship?.id)) fail(manifestFile, `duplicate flagship ID ${flagship?.id}.`);
    flagshipIds.add(flagship?.id);
  }
}

const uiFile = `${control}redesign-ui-verification.md`;
const guideFile = `${control}redesign-guide-coverage.md`;
const [uiText, guideText] = await Promise.all([
  requiredText(uiFile),
  requiredText(guideFile),
  requiredText(`${control}futuristic-redesign-strategy.md`),
  requiredText(`${control}REDESIGN_CHECKPOINT.md`)
]);

const uiRows = tableRows(uiText, /^\d{2}\s/);
if (uiRows.length !== 32) fail(uiFile, `expected 32 numbered project rows; found ${uiRows.length}. Restore IDs 01–32.`);
const uiIds = new Set();
const checkLabels = ["F", "D", "M", "K", "R", "X"];
for (const row of uiRows) {
  const id = Number(row[0].slice(0, 2));
  if (id < 1 || id > 32 || uiIds.has(id)) fail(uiFile, `invalid or duplicate project row ${row[0]}; use each ID 01–32 once.`);
  uiIds.add(id);
  if (row.length !== 9) {
    fail(uiFile, `project ${id} has ${row.length} columns; expected identity, action, evidence and six status columns. Escape literal table pipes.`);
    continue;
  }
  row.slice(3).forEach((status, index) => {
    // Pending, Pass and Fail are literal states. N/A must explain its reason.
    if (!/^(?:Pending|Pass|Fail|N\/A\s*(?::|[-–—])\s*\S.*)$/.test(status)) {
      fail(uiFile, `project ${id}, ${checkLabels[index]} status ${JSON.stringify(status)} is invalid; use Pending, Pass, Fail, or N/A: <reason>.`);
    }
  });
}
for (let id = 1; id <= 32; id += 1) {
  if (!uiIds.has(id)) fail(uiFile, `missing project verification row ${String(id).padStart(2, "0")}.`);
}

const guideRows = tableRows(guideText, /^(?:\d{2}|F\d+)$/);
const guideLabs = guideRows.filter((row) => /^\d{2}$/.test(row[0]));
const guideFlagships = guideRows.filter((row) => /^F\d+$/.test(row[0]));
if (guideLabs.length !== 30) fail(guideFile, `expected 30 lab coverage rows; found ${guideLabs.length}.`);
if (guideFlagships.length !== 2) fail(guideFile, `expected 2 flagship coverage rows; found ${guideFlagships.length}.`);
const seenGuideIds = new Set();
for (const row of guideRows) {
  if (seenGuideIds.has(row[0])) fail(guideFile, `duplicate coverage ID ${row[0]}.`);
  seenGuideIds.add(row[0]);
  if (row.length !== 5) fail(guideFile, `coverage row ${row[0]} needs five columns; escape literal table pipes.`);
}
for (const lab of labs) {
  if (!lab) continue;
  const id = String(lab.id).padStart(2, "0");
  const matches = guideLabs.filter((row) => row[0] === id);
  if (matches.length !== 1) {
    fail(guideFile, `expected exactly one row for lab ${id}; found ${matches.length}.`);
    continue;
  }
  const row = matches[0];
  if (canonicalText(row[1] ?? "") !== lab.project || canonicalText(row[2] ?? "") !== lab.slug) {
    fail(guideFile, `lab ${id} must use canonical name "${lab.project}" and slug "${lab.slug}" from project-manifest.json.`);
  }
}
for (const flagship of flagships) {
  if (!flagship) continue;
  const matches = guideFlagships.filter((row) => canonicalText(row[2] ?? "") === flagship.id);
  if (matches.length !== 1 || canonicalText(matches[0]?.[1] ?? "") !== flagship.name) {
    fail(guideFile, `include exactly one flagship row named "${flagship.name}" with canonical ID "${flagship.id}".`);
  }
}

const captureRoot = `${control}redesign-reference-captures/`;
const captureReadmeFile = `${captureRoot}README.md`;
const captureReadme = await requiredText(captureReadmeFile);
for (const name of captureNames) {
  const file = `${captureRoot}${name}`;
  if (!captureReadme.includes(name)) fail(captureReadmeFile, `document capture ${name} and its real source/state.`);
  let handle;
  try {
    handle = await open(new URL(file, root), "r");
    const { size } = await handle.stat();
    const header = Buffer.alloc(jpegSignature.length);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (bytesRead !== jpegSignature.length || !header.equals(jpegSignature)) {
      fail(file, "missing JPEG SOI/marker signature (FF D8 FF); restore the original JPEG browser capture.");
    }
    const trailer = Buffer.alloc(jpegEndMarker.length);
    if (size < jpegSignature.length + jpegEndMarker.length) {
      fail(file, "capture is too short to contain JPEG start and end markers; restore the complete screenshot.");
    } else {
      const tail = await handle.read(trailer, 0, trailer.length, size - trailer.length);
      if (tail.bytesRead !== jpegEndMarker.length || !trailer.equals(jpegEndMarker)) {
        fail(file, "missing JPEG EOI marker (FF D9) at file end; restore the complete, untruncated browser capture.");
      }
    }
  } catch (error) {
    fail(file, `cannot read capture (${error.code ?? error.message}); restore the saved browser JPEG.`);
  } finally {
    await handle?.close();
  }
}

if (failures.length) {
  console.error(`Redesign checkpoint integrity failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):\n- ${failures.join("\n- ")}`);
  console.error("These are saved-checkpoint checks only; no application/UI tests were run.");
  process.exitCode = 1;
} else {
  console.log("Redesign checkpoint integrity only: 30 canonical labs, 2 flagships, 32 UI matrix rows, guide coverage, planning/checkpoint documents and 4 JPEG capture start/end signatures verified.");
  console.log("NOT application/UI tests passed. JPEG signatures do not prove screenshot authenticity; capture provenance and all functional, visual, accessibility, build and deployment acceptance still require separate verification.");
}
