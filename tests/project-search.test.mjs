import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createProjectSearchIndex,
  searchProjects,
  MAX_PROJECT_QUERY_LENGTH,
  MAX_PROJECT_RESULTS
} from "../shared/project-search.js";

const manifest = JSON.parse(await readFile(new URL("../docs/project-control/project-manifest.json", import.meta.url), "utf8"));
const index = createProjectSearchIndex(manifest);

test("canonical index contains all 30 labs and two public flagship records", () => {
  assert.equal(index.length, 32);
  assert.equal(new Set(index.map((project) => project.id)).size, 32);
  for (const lab of manifest.labs) {
    const project = index.find((item) => item.labId === lab.id);
    assert.equal(project.title, lab.project);
    assert.equal(project.slug, lab.slug);
    assert.equal(project.certificate, lab.credential);
    assert.equal(project.category, lab.category);
    assert.equal(project.route, `/labs/#/lab/${lab.slug}`);
    assert.ok(project.keywords.length > 0);
  }
  assert.equal(index.find((item) => item.id === "timber-cft-pro").route, "/timber-demo/");
  assert.equal(index.find((item) => item.id === "printing-press-erp").route,
    "https://lakshmipriya-erp-demo.industrious-keyboard.workers.dev/owner");
});

test("every exact canonical project name ranks that project first", () => {
  for (const project of index) assert.equal(searchProjects(index, project.title)[0].id, project.id);
});

test("certificate query identifies its matching lab", () => {
  assert.equal(searchProjects(index, "OWASP Top 10 - 2021")[0].id, "lab-24");
  assert.equal(searchProjects(index, "The Bits and Bytes of Computer Networking")[0].id, "lab-26");
});

test("category text and multiword terms match across fields", () => {
  assert.equal(searchProjects(index, "cybersecurity recovery")[0].id, "lab-23");
  assert.equal(searchProjects(index, "networking rollback")[0].id, "lab-26");
  assert.equal(searchProjects(index, "programming data outlier")[0].id, "lab-19");
  assert.equal(searchProjects(index, "wood GST invoice")[0].id, "timber-cft-pro");
});

test("normalizes case, whitespace, diacritics and punctuation without changing labels", () => {
  const results = searchProjects(index, "  MÍNI\n\t RÁG    STÚDIO  ");
  assert.equal(results[0].title, "Mini RAG Studio");
  assert.equal(results[0].route, "/labs/#/lab/mini-rag-studio");
  assert.equal(searchProjects(index, "proof—to—interview")[0].id, "lab-27");
});

test("normalizes diacritics in indexed text as well as query", () => {
  const fixture = createProjectSearchIndex({ labs: [
    { id: 1, slug: "cafe-planner", project: "Café Planner", category: "software-data", credential: "Résumé writing" }
  ] });
  assert.equal(searchProjects(fixture, "cafe")[0].title, "Café Planner");
  assert.equal(searchProjects(fixture, "resume")[0].title, "Café Planner");
});

test("predictive word prefixes are literal and no misspelling correction is invented", () => {
  assert.equal(searchProjects(index, "tim")[0].id, "timber-cft-pro");
  assert.equal(searchProjects(index, "outli sens")[0].id, "lab-19");
  assert.deepEqual(searchProjects(index, "timbre calcualtor"), []);
  assert.deepEqual(searchProjects(index, "qzxv-unmatched"), []);
  assert.deepEqual(searchProjects(index, "timber qzxv"), []);
});

test("other-field matching avoids accidental inside-word substrings", () => {
  const fixture = createProjectSearchIndex({ labs: [
    { id: 1, slug: "ledger", project: "Ledger", category: "software-data", credential: "Paid internship" }
  ] });
  assert.deepEqual(searchProjects(fixture, "ai"), []);
});

test("empty query gives bounded featured defaults with both flagships", () => {
  assert.deepEqual(searchProjects(index, "").map((item) => item.id), [
    "printing-press-erp", "timber-cft-pro", "lab-01", "lab-02", "lab-19", "lab-26"
  ]);
  assert.deepEqual(searchProjects(index, " \n\t "), searchProjects(index, ""));
  assert.equal(searchProjects(index, "", { limit: 3 }).length, 3);
});

test("category filter supports canonical keys, display labels and all", () => {
  const cloud = searchProjects(index, "", { category: "cloud", limit: 32 });
  assert.equal(cloud.length, 5);
  assert.ok(cloud.every((item) => item.category === "cloud"));
  assert.deepEqual(searchProjects(index, "", { category: "Cloud & Networking", limit: 32 }), cloud);
  assert.equal(searchProjects(index, "", { category: "AI & ML", limit: 32 }).length, 10);
  assert.equal(searchProjects(index, "", { category: "flagship", limit: 32 }).length, 2);
  assert.equal(searchProjects(index, "", { category: "all", limit: 32 }).length, 32);
  assert.deepEqual(searchProjects(index, "timber", { category: "cybersecurity" }), []);
  assert.deepEqual(searchProjects(index, "", { category: "unknown-category" }), []);
  assert.deepEqual(searchProjects(index, "timber", { category: "unknown-category" }), []);
});

test("title exact outranks prefix, contains and keyword-only matches", () => {
  const fixture = createProjectSearchIndex({ labs: [
    { id: 1, slug: "misc-tool", project: "Other Tool", category: "cloud", credential: "Cloud Plan" },
    { id: 2, slug: "extended-tool", project: "Cloud Plan Explorer", category: "cloud", credential: "Course" },
    { id: 3, slug: "inside-tool", project: "A Cloud Plan", category: "cloud", credential: "Course" },
    { id: 4, slug: "exact-tool", project: "Cloud Plan", category: "cloud", credential: "Course" }
  ] });
  assert.deepEqual(searchProjects(fixture, "cloud plan").map((item) => item.id), ["lab-04", "lab-02", "lab-03", "lab-01"]);
});

test("equal relevance ties are canonical and independent of input order", () => {
  const fixture = createProjectSearchIndex({ labs: [
    { id: 8, slug: "beta", project: "Beta", category: "cloud", credential: "Shared certificate" },
    { id: 3, slug: "alpha", project: "Alpha", category: "cloud", credential: "Shared certificate" }
  ] });
  const expected = ["lab-03", "lab-08"];
  assert.deepEqual(searchProjects(fixture, "shared").map((item) => item.id), expected);
  assert.deepEqual(searchProjects([...fixture].reverse(), "shared").map((item) => item.id), expected);
  assert.deepEqual(searchProjects([...index].reverse(), ""), searchProjects(index, ""));
});

test("limits are bounded and predictable", () => {
  assert.deepEqual(searchProjects(index, "", { limit: 0 }), []);
  assert.deepEqual(searchProjects(index, "", { limit: -4 }), []);
  assert.equal(searchProjects(index, "", { limit: 2.8 }).length, 2);
  assert.equal(searchProjects(index, "", { limit: 10000 }).length, MAX_PROJECT_RESULTS);
  assert.equal(searchProjects(index, "", { limit: NaN }).length, 6);
  assert.equal(searchProjects(index, "", { limit: Infinity }).length, 6);
});

test("query length is bounded before normalization", () => {
  const bounded = "timber".padEnd(MAX_PROJECT_QUERY_LENGTH, " ");
  assert.deepEqual(searchProjects(index, `${bounded} unavailableterm`), searchProjects(index, bounded));
  assert.deepEqual(searchProjects(index, "x".repeat(MAX_PROJECT_QUERY_LENGTH * 1000)), []);
});

test("manifest, index, keywords, query and options are not mutated", () => {
  const source = structuredClone(manifest);
  const before = structuredClone(source);
  source.labs.forEach(Object.freeze);
  Object.freeze(source.labs);
  Object.freeze(source);
  const built = createProjectSearchIndex(source);
  const saved = structuredClone(built);
  built.forEach((item) => { Object.freeze(item.keywords); Object.freeze(item); });
  Object.freeze(built);
  const options = Object.freeze({ category: "all", limit: 3 });
  const query = "timber";
  searchProjects(built, query, options);
  searchProjects(built, "", options);
  assert.deepEqual(source, before);
  assert.deepEqual(built, saved);
  assert.equal(query, "timber");
  assert.deepEqual(options, { category: "all", limit: 3 });
});

test("results return clean original records without injected highlighting or normalized labels", () => {
  const result = searchProjects(index, "timber")[0];
  assert.strictEqual(result, index.find((item) => item.id === "timber-cft-pro"));
  assert.equal(result.title, "Timber CFT Pro with Billing");
  assert.ok(!Object.keys(result).some((key) => /html|highlight|score/i.test(key)));
  assert.ok(!JSON.stringify(result).includes("<mark>"));
  assert.deepEqual(searchProjects(index, '<img src=x onerror="alert(1)">'), []);
});

test("caller-provided flagship URLs cannot switch public ERP to a private endpoint", () => {
  const source = structuredClone(manifest);
  source.flagships[0].route = "https://private.invalid/admin";
  source.flagships[0].url = "javascript:alert(1)";
  const built = createProjectSearchIndex(source);
  assert.equal(built[0].route, "https://lakshmipriya-erp-demo.industrious-keyboard.workers.dev/owner");
  assert.ok(!JSON.stringify(built).includes("private.invalid"));
});

test("invalid manifest input is rejected instead of creating unsafe routes", () => {
  assert.throws(() => createProjectSearchIndex(null), TypeError);
  assert.throws(() => createProjectSearchIndex({ labs: [{ ...manifest.labs[0], slug: "../private" }] }), TypeError);
  assert.throws(() => createProjectSearchIndex({ labs: [manifest.labs[0], manifest.labs[0]] }), TypeError);
  assert.throws(() => searchProjects(null, ""), TypeError);
});
