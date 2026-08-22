import{r as m,j as e}from"./index-M_J7RBgX.js";const _={copy:"Copy matching files",move:"Move matching files"},x={stop:"Stop on the first failure",continue:"Record the failure and continue"},k={skip:"Skip an existing destination",rename:"Create a numbered destination",overwrite:"Back up, then overwrite"},p={taskName:"Archive weekly PDF invoices from the incoming folder into the finance archive.",sourcePattern:"C:/Office/Incoming/**/*.pdf",destinationPattern:"C:/Office/Archive/{date}/{name}",operation:"move",failurePolicy:"continue",duplicatePolicy:"rename"};function P(t){return String(t).replace(/\\/g,"/").split("/").includes("..")}function C(t={}){const a={};String(t.taskName??"").trim().length<20&&(a.taskName="Describe the repeated file task in at least 20 characters.");const n=String(t.sourcePattern??"").trim(),r=String(t.destinationPattern??"").trim();return(n.length<3||!/[?*\[]/.test(n))&&(a.sourcePattern="Provide a bounded file glob such as C:/Incoming/**/*.pdf."),(n.length>500||P(n))&&(a.sourcePattern="Source pattern must be at most 500 characters and cannot contain .. traversal."),(r.length<3||!/\{(?:name|stem|suffix|date)\}/.test(r))&&(a.destinationPattern="Destination pattern must include {name}, {stem}, {suffix}, or {date}."),(r.length>500||P(r)||/[*?\[]/.test(r))&&(a.destinationPattern="Destination must be at most 500 characters, cannot contain .., and cannot use glob wildcards."),[...r.matchAll(/\{([^{}]+)\}/g)].map(i=>i[1]).some(i=>!["name","stem","suffix","date"].includes(i))&&(a.destinationPattern="Destination supports only {name}, {stem}, {suffix}, and {date} placeholders."),n&&r&&n.toLowerCase()===r.toLowerCase()&&(a.destinationPattern="Source and destination patterns must differ."),Object.hasOwn(_,t.operation)||(a.operation="Choose copy or move."),Object.hasOwn(x,t.failurePolicy)||(a.failurePolicy="Choose a failure policy."),Object.hasOwn(k,t.duplicatePolicy)||(a.duplicatePolicy="Choose a duplicate policy."),a}function l(t){return JSON.stringify(String(t))}function b(t){const a=C(t);if(Object.keys(a).length)return{errors:a,code:"",checklist:[]};const n=`"""Generated safety-first file automation scaffold.

Review paths and keep DRY_RUN = True for the first execution.
The script writes an audit/undo manifest but does not change matched files in dry-run mode.
"""
from __future__ import annotations

import glob
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

DRY_RUN = True
SOURCE_PATTERN = ${l(t.sourcePattern.trim())}
DESTINATION_PATTERN = ${l(t.destinationPattern.trim())}
OPERATION = ${l(t.operation)}
FAILURE_POLICY = ${l(t.failurePolicy)}
DUPLICATE_POLICY = ${l(t.duplicatePolicy)}
MAX_FILES = 1000
AUDIT_PATH = Path("automation-audit.json")


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def render_destination(source: Path, run_date: str) -> Path:
    rendered = DESTINATION_PATTERN.format(
        name=source.name, stem=source.stem, suffix=source.suffix, date=run_date
    )
    return Path(rendered).expanduser().resolve()


def validate_paths(source: Path, destination: Path) -> None:
    if not source.exists() or not source.is_file():
        raise FileNotFoundError(f"Source is not a readable file: {source}")
    if source.resolve() == destination:
        raise ValueError("Source and destination resolve to the same file")
    destination.parent.mkdir(parents=True, exist_ok=True) if not DRY_RUN else None


def numbered_destination(destination: Path) -> Path:
    candidate = destination
    counter = 1
    while candidate.exists():
        candidate = destination.with_name(f"{destination.stem}-{counter}{destination.suffix}")
        counter += 1
    return candidate


def process_file(source: Path, run_date: str, backup_dir: Path) -> dict:
    destination = render_destination(source, run_date)
    validate_paths(source, destination)
    record = {
        "source": str(source), "destination": str(destination), "operation": OPERATION,
        "dry_run": DRY_RUN, "source_sha256": checksum(source), "status": "planned", "undo": None,
    }
    if destination.exists():
        if DUPLICATE_POLICY == "skip":
            record["status"] = "skipped-existing"
            return record
        if DUPLICATE_POLICY == "rename":
            destination = numbered_destination(destination)
            record["destination"] = str(destination)
        if DUPLICATE_POLICY == "overwrite":
            backup = backup_dir / destination.name
            record["replaced_backup"] = str(backup)
            if not DRY_RUN:
                backup.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(destination, backup)
                destination.unlink()
    if not DRY_RUN:
        destination.parent.mkdir(parents=True, exist_ok=True)
        if OPERATION == "copy":
            shutil.copy2(source, destination)
            record["undo"] = {"action": "delete-copy", "path": str(destination)}
        else:
            shutil.move(str(source), str(destination))
            record["undo"] = {"action": "move-back", "from": str(destination), "to": str(source)}
        if record.get("replaced_backup"):
            record["undo"]["then_restore"] = {"from": record["replaced_backup"], "to": str(destination)}
        record["status"] = "completed"
    return record


def main() -> int:
    started = datetime.now(timezone.utc)
    matches = [Path(item).resolve() for item in glob.glob(SOURCE_PATTERN, recursive=True)]
    if len(matches) > MAX_FILES:
        raise RuntimeError(f"Refusing {len(matches)} matches; safe limit is {MAX_FILES}")
    audit = {"task": ${l(t.taskName.trim())}, "started_utc": started.isoformat(), "dry_run": DRY_RUN, "records": []}
    backup_dir = Path("automation-backup") / started.strftime("%Y%m%dT%H%M%SZ")
    for source in matches:
        try:
            audit["records"].append(process_file(source, started.strftime("%Y-%m-%d"), backup_dir))
        except (PermissionError, FileNotFoundError, ValueError, OSError) as error:
            audit["records"].append({"source": str(source), "status": "error", "error": f"{type(error).__name__}: {error}"})
            if FAILURE_POLICY == "stop":
                break
    AUDIT_PATH.write_text(json.dumps(audit, indent=2), encoding="utf-8")
    return 1 if any(item["status"] == "error" for item in audit["records"]) else 0


if __name__ == "__main__":
    raise SystemExit(main())
`;return{errors:{},code:n,checklist:["Copy the scaffold to a new .py file and review every constant at the top.","Create a disposable test directory containing normal, duplicate, read-only, and unexpected file names.","Run with DRY_RUN = True; inspect match count, destinations, checksums, errors, and automation-audit.json.","Confirm the glob cannot reach unrelated folders and the 1,000-file safety limit is appropriate.","Test the selected duplicate and failure policies deliberately.","Use copied test data to set DRY_RUN = False; verify files and execute the recorded undo steps manually.","Keep audit and backup artifacts until the business owner signs off; schedule only after review."]}}const y={taskName:"",sourcePattern:"",destinationPattern:"",operation:"",failurePolicy:"",duplicatePolicy:""};function E(){const[t,a]=m.useState(y),[n,r]=m.useState(null),[s,i]=m.useState(!1),o=d=>a(j=>({...j,[d.target.name]:d.target.value})),u=d=>{d.preventDefault(),i(!1),r(b(t))},g=()=>{a(p),i(!1),r(b(p))},v=()=>{a(y),r(null),i(!1)},T=async()=>{await navigator.clipboard.writeText(n.code),i(!0)},c=(n==null?void 0:n.errors)??{};return e.jsxs("section",{className:"lab-tool","aria-labelledby":"python-automator-title",children:[e.jsxs("div",{className:"intro",children:[e.jsx("h2",{id:"python-automator-title",children:"Exception-First Python Automator"}),e.jsx("p",{children:"Generate a reviewable stdlib-only file-task scaffold. This lab never executes code or reads, writes, copies, or moves your files."})]}),e.jsxs("form",{className:"controls lab-form",onSubmit:u,noValidate:!0,children:[e.jsx(f,{label:"Repeated task",name:"taskName",value:t.taskName,error:c.taskName,onChange:o}),e.jsx(f,{label:"Source glob",name:"sourcePattern",value:t.sourcePattern,error:c.sourcePattern,onChange:o,placeholder:"C:/Incoming/**/*.pdf"}),e.jsx(f,{label:"Destination pattern",name:"destinationPattern",value:t.destinationPattern,error:c.destinationPattern,onChange:o,placeholder:"C:/Archive/{date}/{name}"}),e.jsx(h,{label:"Operation",name:"operation",value:t.operation,options:_,error:c.operation,onChange:o}),e.jsx(h,{label:"Failure policy",name:"failurePolicy",value:t.failurePolicy,options:x,error:c.failurePolicy,onChange:o}),e.jsx(h,{label:"Duplicate policy",name:"duplicatePolicy",value:t.duplicatePolicy,options:k,error:c.duplicatePolicy,onChange:o}),e.jsxs("div",{className:"button-row",children:[e.jsx("button",{type:"submit",children:"Generate safe scaffold"}),e.jsx("button",{type:"button",onClick:g,children:"Load example"}),e.jsx("button",{type:"button",onClick:v,children:"Reset"})]})]}),n&&!Object.keys(c).length&&e.jsxs("div",{className:"lab-results","aria-live":"polite",children:[e.jsxs("section",{className:"implementation-notice",children:[e.jsx("h3",{children:"Python scaffold"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Dry-run is on by default."})," The generated script uses only Python’s standard library and writes an audit manifest when you run it."]}),e.jsx("textarea",{readOnly:!0,rows:"28",value:n.code,"aria-label":"Generated Python automation scaffold",spellCheck:"false"}),e.jsx("button",{type:"button",onClick:T,children:"Copy Python scaffold"}),e.jsx("span",{role:"status",children:s?" Code copied.":""})]}),e.jsxs("section",{className:"implementation-notice",children:[e.jsx("h3",{children:"Test-run checklist"}),e.jsx("ol",{children:n.checklist.map(d=>e.jsx("li",{children:d},d))})]})]})]})}function f({label:t,name:a,value:n,error:r,onChange:s,placeholder:i}){return e.jsxs("label",{children:[t,e.jsx("input",{name:a,value:n,onChange:s,placeholder:i,"aria-invalid":!!r}),r&&e.jsx("small",{role:"alert",children:r})]})}function h({label:t,name:a,value:n,options:r,error:s,onChange:i}){return e.jsxs("label",{children:[t,e.jsxs("select",{name:a,value:n,onChange:i,"aria-invalid":!!s,children:[e.jsx("option",{value:"",children:"Choose one"}),Object.entries(r).map(([o,u])=>e.jsx("option",{value:o,children:u},o))]}),s&&e.jsx("small",{role:"alert",children:s})]})}export{b as buildPythonAutomation,E as default,C as validateAutomationPlan};
