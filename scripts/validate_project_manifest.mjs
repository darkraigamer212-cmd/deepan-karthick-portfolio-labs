import { readFile } from "node:fs/promises";

const manifestUrl = new URL("../docs/project-control/project-manifest.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
const errors = [];

if (manifest.credentialCount !== 30) {
  errors.push(`credentialCount must be 30; received ${manifest.credentialCount}`);
}

if (!Array.isArray(manifest.labs) || manifest.labs.length !== 30) {
  errors.push(`labs must contain exactly 30 entries; received ${manifest.labs?.length ?? "none"}`);
}

if (!Array.isArray(manifest.flagships) || manifest.flagships.length !== 2) {
  errors.push(`flagships must contain exactly 2 entries; received ${manifest.flagships?.length ?? "none"}`);
}

const ids = new Set();
const slugs = new Set();

for (const lab of manifest.labs ?? []) {
  if (!Number.isInteger(lab.id) || lab.id < 1 || lab.id > 30) {
    errors.push(`invalid lab id: ${lab.id}`);
  }
  if (ids.has(lab.id)) errors.push(`duplicate lab id: ${lab.id}`);
  if (slugs.has(lab.slug)) errors.push(`duplicate lab slug: ${lab.slug}`);
  if (!lab.credential || !lab.project || !lab.category || !lab.batch || !lab.status) {
    errors.push(`lab ${lab.id} is missing a required field`);
  }
  ids.add(lab.id);
  slugs.add(lab.slug);
}

for (let id = 1; id <= 30; id += 1) {
  if (!ids.has(id)) errors.push(`missing lab id: ${id}`);
}

if (errors.length) {
  console.error("Project manifest validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log("Project manifest valid: 30 labs and 2 flagships.");
