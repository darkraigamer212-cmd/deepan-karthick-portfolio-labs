export const OPERATION_LABELS = {
  copy: "Copy matching files",
  move: "Move matching files"
};

export const FAILURE_POLICIES = {
  stop: "Stop on the first failure",
  continue: "Record the failure and continue"
};

export const DUPLICATE_POLICIES = {
  skip: "Skip an existing destination",
  rename: "Create a numbered destination",
  overwrite: "Back up, then overwrite"
};

export const PYTHON_AUTOMATOR_EXAMPLE = {
  taskName: "Archive weekly PDF invoices from the incoming folder into the finance archive.",
  sourcePattern: "C:/Office/Incoming/**/*.pdf",
  destinationPattern: "C:/Office/Archive/{date}/{name}",
  operation: "move",
  failurePolicy: "continue",
  duplicatePolicy: "rename"
};

function hasUnsafeTraversal(value) {
  return String(value).replace(/\\/g, "/").split("/").includes("..");
}

export function validateAutomationPlan(input = {}) {
  const errors = {};
  if (String(input.taskName ?? "").trim().length < 20) errors.taskName = "Describe the repeated file task in at least 20 characters.";
  const source = String(input.sourcePattern ?? "").trim();
  const destination = String(input.destinationPattern ?? "").trim();
  if (source.length < 3 || !/[?*\[]/.test(source)) errors.sourcePattern = "Provide a bounded file glob such as C:/Incoming/**/*.pdf.";
  if (source.length > 500 || hasUnsafeTraversal(source)) errors.sourcePattern = "Source pattern must be at most 500 characters and cannot contain .. traversal.";
  if (destination.length < 3 || !/\{(?:name|stem|suffix|date)\}/.test(destination)) errors.destinationPattern = "Destination pattern must include {name}, {stem}, {suffix}, or {date}.";
  if (destination.length > 500 || hasUnsafeTraversal(destination) || /[*?\[]/.test(destination)) errors.destinationPattern = "Destination must be at most 500 characters, cannot contain .., and cannot use glob wildcards.";
  const placeholders = [...destination.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]);
  if (placeholders.some((placeholder) => !["name", "stem", "suffix", "date"].includes(placeholder))) {
    errors.destinationPattern = "Destination supports only {name}, {stem}, {suffix}, and {date} placeholders.";
  }
  if (source && destination && source.toLowerCase() === destination.toLowerCase()) errors.destinationPattern = "Source and destination patterns must differ.";
  if (!Object.hasOwn(OPERATION_LABELS, input.operation)) errors.operation = "Choose copy or move.";
  if (!Object.hasOwn(FAILURE_POLICIES, input.failurePolicy)) errors.failurePolicy = "Choose a failure policy.";
  if (!Object.hasOwn(DUPLICATE_POLICIES, input.duplicatePolicy)) errors.duplicatePolicy = "Choose a duplicate policy.";
  return errors;
}

function pythonString(value) {
  return JSON.stringify(String(value));
}

export function buildPythonAutomation(input) {
  const errors = validateAutomationPlan(input);
  if (Object.keys(errors).length) return { errors, code: "", checklist: [] };
  const code = `"""Generated safety-first file automation scaffold.

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
SOURCE_PATTERN = ${pythonString(input.sourcePattern.trim())}
DESTINATION_PATTERN = ${pythonString(input.destinationPattern.trim())}
OPERATION = ${pythonString(input.operation)}
FAILURE_POLICY = ${pythonString(input.failurePolicy)}
DUPLICATE_POLICY = ${pythonString(input.duplicatePolicy)}
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
    audit = {"task": ${pythonString(input.taskName.trim())}, "started_utc": started.isoformat(), "dry_run": DRY_RUN, "records": []}
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
`;
  const checklist = [
    "Copy the scaffold to a new .py file and review every constant at the top.",
    "Create a disposable test directory containing normal, duplicate, read-only, and unexpected file names.",
    "Run with DRY_RUN = True; inspect match count, destinations, checksums, errors, and automation-audit.json.",
    "Confirm the glob cannot reach unrelated folders and the 1,000-file safety limit is appropriate.",
    "Test the selected duplicate and failure policies deliberately.",
    "Use copied test data to set DRY_RUN = False; verify files and execute the recorded undo steps manually.",
    "Keep audit and backup artifacts until the business owner signs off; schedule only after review."
  ];
  return { errors: {}, code, checklist };
}
