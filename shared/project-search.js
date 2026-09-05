/** Local, deterministic project lookup. No network, DOM, fuzzy matching or HTML. */
export const MAX_PROJECT_QUERY_LENGTH = 160;
export const MAX_PROJECT_RESULTS = 32;

const CATEGORY_LABELS = {
  "ai-ml": "AI & ML",
  cloud: "Cloud & Networking",
  "software-data": "Programming & Data",
  "business-finance": "Business & Finance",
  cybersecurity: "Cybersecurity",
  flagship: "Flagship systems"
};

// Task terms describe the existing source workflows, not additional capabilities.
const LAB_KEYWORDS = {
  "ai-workflow-canvas": ["workflow planning", "human review", "risk register", "checklist"],
  "mini-rag-studio": ["document retrieval", "extractive answer", "ranked evidence", "knowledge search"],
  "gan-latent-gallery": ["abstract background", "latent coordinates", "SVG export", "design simulation"],
  "cnn-feature-explorer": ["image pixels", "convolution kernel", "feature map", "edge detection"],
  "attention-text-explorer": ["text tokens", "attention weights", "heatmap", "sequence ranking"],
  "neural-network-playground": ["neuron weights", "activation", "binary prediction", "OR gate"],
  "genai-lifecycle-explorer": ["readiness", "lifecycle planning", "blockers", "project artifacts"],
  "ai-opportunity-scorer": ["opportunity assessment", "business ratings", "guardrails", "score"],
  "prompt-workbench": ["prompt quality", "instructions", "context", "copy prompt"],
  "ml-model-lab": ["classification", "nearest neighbours", "KNN", "leave one out", "prediction"],
  "cloud-regret-premortem": ["migration planning", "regret scenarios", "risk", "decision memo"],
  "aws-outage-storyboard": ["customer journey", "outage rehearsal", "failure stories", "GameDay checklist"],
  "azure-access-handoff": ["access review", "permissions", "handoff plan", "security checklist"],
  "gcp-promise-ledger": ["pilot hypothesis", "evidence gates", "assumptions", "sponsor memo"],
  "responsive-constraint-handoff": ["responsive layout", "viewport", "CSS grid", "keyboard focus", "design handoff"],
  "exception-first-python-automator": ["Python scaffold", "automation", "exception handling", "test checklist"],
  "queue-fairness-replay": ["FIFO", "priority aging", "waiting time", "queue comparison", "C contract"],
  "safe-c-input-harness": ["C input validation", "fgets", "strtol", "boundary tests", "code skeleton"],
  "csv-claim-stress-tester": ["CSV analysis", "data quality", "outlier sensitivity", "pandas recipe", "claim evidence"],
  "llm-data-contract-firewall": ["data privacy", "field metadata", "JSONL schema", "dataset card", "retention"],
  "shortage-response-tradeoff": ["allocation policy", "purchase cap", "buyer access", "revenue comparison", "owner memo"],
  "lp-exit-rehearsal": ["liquidity pool", "exit scenario", "stop triggers", "pre commitment memo", "DeFi simulation"],
  "account-recovery-drill": ["account recovery", "device loss", "no secrets", "tabletop exercise", "emergency cards"],
  "feature-misuse-contract": ["OWASP", "trust boundaries", "defensive misuse", "PR acceptance contract"],
  "share-link-afterlife": ["sharing privacy", "revocation", "expiry", "residue ledger", "pre share contract"],
  "network-change-rollback": ["network change", "CIDR", "inventory conflict", "rollback plan", "stakeholder summary"],
  "proof-to-interview-compiler": ["resume evidence", "interview preparation", "STAR answer", "citations", "skills gap"],
  "containment-side-effect-ledger": ["SOC analyst", "containment review", "customer side effects", "escalation", "handoff"],
  "detection-contract-drift-guard": ["schema drift", "detection rules", "repair contract", "regression vectors", "Python harness"],
  "assurance-change-shockwave": ["assurance claims", "evidence dependencies", "renewal order", "risk windows", "executive memo"]
};

const FLAGSHIPS = [
  {
    id: "printing-press-erp",
    title: "Printing Press ERP",
    route: "https://lakshmipriya-erp-demo.industrious-keyboard.workers.dev/owner",
    keywords: ["printing business", "production orders", "inventory", "invoices", "staff", "public demo"]
  },
  {
    id: "timber-cft-pro",
    title: "Timber CFT Pro with Billing",
    route: "/timber-demo/",
    keywords: ["timber calculator", "wood measurement", "CFT M3", "billing invoice", "GST pricing", "local history", "print PDF"]
  }
];

function normalize(value) {
  return String(value ?? "").normalize("NFKD").replace(/\p{M}/gu, "")
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/**
 * Build clean records from the caller's canonical manifest. Flagship routes are
 * deliberately fixed to the public demo; manifest data cannot supply a private URL.
 * A caller may supply a smaller lab manifest for testing; the real manifest has 30.
 */
export function createProjectSearchIndex(manifest) {
  if (!manifest || !Array.isArray(manifest.labs)) {
    throw new TypeError("createProjectSearchIndex requires a manifest with a labs array.");
  }
  const ids = new Set();
  const slugs = new Set();
  const labs = manifest.labs.map((lab) => {
    if (!Number.isInteger(lab?.id) || lab.id < 1 || lab.id > 30
      || typeof lab.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lab.slug)
      || typeof lab.project !== "string" || !lab.project.trim()
      || typeof lab.category !== "string" || !lab.category.trim()
      || typeof lab.credential !== "string") {
      throw new TypeError("Each search lab needs ID 1–30, a safe slug, project, category and credential strings.");
    }
    if (ids.has(lab.id) || slugs.has(lab.slug)) throw new TypeError("Search lab IDs and slugs must be unique.");
    ids.add(lab.id);
    slugs.add(lab.slug);
    return {
      id: `lab-${String(lab.id).padStart(2, "0")}`,
      kind: "lab",
      labId: lab.id,
      slug: lab.slug,
      title: lab.project,
      route: `/labs/#/lab/${lab.slug}`,
      category: lab.category,
      categoryLabel: CATEGORY_LABELS[lab.category] ?? lab.category,
      certificate: lab.credential,
      keywords: [...(LAB_KEYWORDS[lab.slug] ?? [])]
    };
  }).sort((a, b) => a.labId - b.labId);

  const flagships = FLAGSHIPS.map((project) => {
    const source = manifest.flagships?.find((item) => item.id === project.id);
    return {
      id: project.id,
      kind: "flagship",
      slug: project.id,
      title: typeof source?.name === "string" && source.name.trim() ? source.name : project.title,
      route: project.route,
      category: "flagship",
      categoryLabel: CATEGORY_LABELS.flagship,
      certificate: "",
      keywords: [...project.keywords]
    };
  });
  return [...flagships, ...labs];
}

function stableOrder(a, b) {
  if (a.kind !== b.kind) return a.kind === "flagship" ? -1 : 1;
  if (a.kind === "flagship") {
    return FLAGSHIPS.findIndex((item) => item.id === a.id) - FLAGSHIPS.findIndex((item) => item.id === b.id);
  }
  return a.labId - b.labId || a.id.localeCompare(b.id, "en");
}

const FEATURED_IDS = ["printing-press-erp", "timber-cft-pro", "lab-01", "lab-02", "lab-19", "lab-26"];
function featuredOrder(a, b) {
  const aRank = FEATURED_IDS.indexOf(a.id);
  const bRank = FEATURED_IDS.indexOf(b.id);
  return (aRank < 0 ? 100 : aRank) - (bRank < 0 ? 100 : bRank) || stableOrder(a, b);
}

function relevance(project, query, tokens) {
  const title = normalize(project.title);
  const titleWords = title.split(" ");
  const words = normalize([
    project.title, project.certificate, project.category, project.categoryLabel,
    ...(project.keywords ?? [])
  ].join(" ")).split(" ");

  // Literal title substring supports partial typing; other fields match word
  // prefixes, avoiding accidental inside-word matches such as "ai" in "paid".
  const phraseInTitle = title.includes(query);
  if (!phraseInTitle && !tokens.every((token) => words.some((word) => word.startsWith(token)))) return -1;
  if (title === query) return 1000;
  if (title.startsWith(query)) return 800;
  if (phraseInTitle) return 600;
  const titleHits = tokens.filter((token) => titleWords.some((word) => word.startsWith(token))).length;
  return 200 + Math.min(99, titleHits * 10);
}

/**
 * Return at most `limit` clean index records (default 6, maximum 32).
 * Every distinct token must match; matching is literal, not edit-distance fuzzy.
 * Category accepts a canonical key or its display label; unknown values return [].
 * Empty query returns featured projects first, respecting category and result limit.
 * Query text is truncated to 160 UTF-16 code units before normalization.
 * Inputs are never mutated; output labels and routes are not normalized or marked up.
 */
export function searchProjects(index, query, { limit = 6, category } = {}) {
  if (!Array.isArray(index)) throw new TypeError("searchProjects requires a project index array.");
  const count = Number.isFinite(limit) ? Math.min(MAX_PROJECT_RESULTS, Math.max(0, Math.floor(limit))) : 6;
  if (!count) return [];
  const categoryQuery = normalize(category);
  const candidates = index.filter((project) => !categoryQuery || categoryQuery === "all"
    || categoryQuery === normalize(project.category) || categoryQuery === normalize(project.categoryLabel));
  const normalizedQuery = normalize(typeof query === "string" ? query.slice(0, MAX_PROJECT_QUERY_LENGTH) : "");
  if (!normalizedQuery) return [...candidates].sort(featuredOrder).slice(0, count);
  const tokens = [...new Set(normalizedQuery.split(" "))];
  return candidates.map((project) => ({ project, score: relevance(project, normalizedQuery, tokens) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || stableOrder(a.project, b.project))
    .slice(0, count).map((item) => item.project);
}
