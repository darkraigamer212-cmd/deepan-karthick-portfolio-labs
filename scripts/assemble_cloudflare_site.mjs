import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "site-dist");

const requiredDirectories = ["portfolio", "labs", "timber-demo"];
for (const directory of requiredDirectories) {
  const source = path.join(root, directory);
  const details = await stat(source).catch(() => null);
  if (!details?.isDirectory()) {
    throw new Error(`Missing ${directory} production output. Run pnpm build first.`);
  }
}

if (path.dirname(output) !== root || path.basename(output) !== "site-dist") {
  throw new Error(`Refusing to replace unexpected output path: ${output}`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Portfolio is the canonical root experience. A duplicate /portfolio path keeps
// previously shared GitHub Pages-style URLs working after the Cloudflare move.
await cp(path.join(root, "portfolio"), output, { recursive: true });
await cp(path.join(root, "portfolio"), path.join(output, "portfolio"), { recursive: true });
await cp(path.join(root, "labs"), path.join(output, "labs"), { recursive: true });
await cp(path.join(root, "timber-demo"), path.join(output, "timber-demo"), { recursive: true });

const generated = path.join(root, "docs", "generated");
const publicGenerated = path.join(output, "docs", "generated");
await mkdir(publicGenerated, { recursive: true });

for (const filename of [
  "karthik_ats_resume.pdf",
  "karthik_startup_resume.pdf",
  "portfolio_labs_complete_manual.pdf"
]) {
  const source = path.join(generated, filename);
  const details = await stat(source).catch(() => null);
  if (details?.isFile()) await cp(source, path.join(publicGenerated, filename));
}

console.log(`Cloudflare site assembled at ${output}`);
