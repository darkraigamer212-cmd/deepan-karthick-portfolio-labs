const MAX_TASKS = 8;
const MAX_ARTIFACTS = 16;
const MAX_CLAIMS = 12;
const ARTIFACT_TYPES = new Set(["code", "test", "report", "demo"]);
const STOP_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "is", "it", "of", "on", "or", "the", "to", "with"]);

export const PROOF_COMPILER_EXAMPLE = {
  targetRole: "Cybersecurity analyst intern",
  taskStatements: "Review security alerts and document evidence and limitations\nAutomate repeatable checks against authentication log fixtures",
  situation: "A local sample authentication log contained normal activity and repeated failed sign-in fixtures.",
  action: "Built a Python parser with documented detection rules and automated tests for benign and repeated-failure cases.",
  outcome: "The local test report showed the rules flagged repeated failed sign-in fixtures and documented false-positive limitations.",
  artifactRows: "LOG-SCAN-CODE|code|Python parser applies documented rules to authentication log fixtures\nLOG-SCAN-TEST|test|Automated tests verify repeated failed sign-in fixtures and benign cases\nLOG-SCAN-REPORT|report|Report documents alert evidence detection limitations and test results",
  skillClaims: "Built a Python parser for authentication log fixtures\nWrote automated tests for repeated failed sign-in detection\nReduced security incidents by 80%"
};

function containsPersonalOrLink(value) {
  return /(?:https?:\/\/|www\.|@)/i.test(String(value));
}

function linesOf(text, maximum, label) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  if (!lines.length) errors.push(`Add at least one ${label}.`);
  if (lines.length > maximum) errors.push(`Use at most ${maximum} ${label}s.`);
  lines.forEach((line, index) => {
    if (line.length < 10 || line.length > 240) errors.push(`${label} ${index + 1} must be 10–240 characters.`);
    if (containsPersonalOrLink(line)) errors.push(`${label} ${index + 1} must stay generic and cannot contain identities or links.`);
  });
  return { lines: lines.slice(0, maximum), errors };
}

export function parseArtifacts(text) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const artifacts = [];
  const errors = [];
  const ids = new Set();
  if (!lines.length) errors.push("Add at least one artifact row.");
  if (lines.length > MAX_ARTIFACTS) errors.push(`Use at most ${MAX_ARTIFACTS} artifacts.`);
  lines.slice(0, MAX_ARTIFACTS).forEach((line, index) => {
    const [id, type, proof, ...extra] = line.split("|").map((part) => part.trim());
    if (!id || !type || !proof || extra.length) {
      errors.push(`Row ${index + 1}: use artifact-id|type|what it proves.`);
      return;
    }
    if (!/^[A-Z0-9][A-Z0-9_-]{1,31}$/i.test(id)) errors.push(`Row ${index + 1}: artifact ID must be 2–32 letters, numbers, underscores, or hyphens.`);
    const key = id.toLowerCase();
    if (ids.has(key)) errors.push(`Row ${index + 1}: duplicate artifact ID “${id}”.`);
    ids.add(key);
    if (!ARTIFACT_TYPES.has(type)) errors.push(`Row ${index + 1}: type must be code, test, report, or demo.`);
    if (proof.length < 12 || proof.length > 240) errors.push(`Row ${index + 1}: proof description must be 12–240 characters.`);
    if (containsPersonalOrLink(id) || containsPersonalOrLink(proof)) errors.push(`Row ${index + 1}: enter generic artifact metadata, not identities or links.`);
    if (/^[A-Z0-9][A-Z0-9_-]{1,31}$/i.test(id) && ARTIFACT_TYPES.has(type) && proof.length >= 12 && proof.length <= 240 && !containsPersonalOrLink(id) && !containsPersonalOrLink(proof)) artifacts.push({ id, type, proof });
  });
  return { artifacts, errors };
}

export function validateProofCompiler(input = {}) {
  const errors = {};
  const targetRole = String(input.targetRole ?? "").trim();
  if (targetRole.length < 8 || targetRole.length > 100 || containsPersonalOrLink(targetRole)) errors.targetRole = "Use a generic target role from 8 to 100 characters without identities or links.";
  for (const field of ["situation", "action", "outcome"]) {
    const value = String(input[field] ?? "").trim();
    if (value.length < 20 || value.length > 500 || containsPersonalOrLink(value)) errors[field] = `Use a generic ${field} from 20 to 500 characters without identities or links.`;
  }
  const tasks = linesOf(input.taskStatements, MAX_TASKS, "task statement");
  const claims = linesOf(input.skillClaims, MAX_CLAIMS, "skill claim");
  const artifacts = parseArtifacts(input.artifactRows);
  if (tasks.errors.length) errors.taskStatements = tasks.errors;
  if (claims.errors.length) errors.skillClaims = claims.errors;
  if (artifacts.errors.length) errors.artifactRows = artifacts.errors;
  return { errors, tasks: tasks.lines, claims: claims.lines, artifacts: artifacts.artifacts };
}

function terms(text) {
  return [...new Set((String(text).toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((term) => term.length > 2 && !STOP_WORDS.has(term)))];
}

function artifactMatches(statement, artifacts) {
  const statementTerms = terms(statement);
  return artifacts.map((artifact) => {
    const proofTerms = new Set(terms(artifact.proof));
    const overlap = statementTerms.filter((term) => proofTerms.has(term));
    return { artifact, overlap, score: overlap.length };
  }).filter((match) => match.score >= 2).sort((left, right) => right.score - left.score || left.artifact.id.localeCompare(right.artifact.id));
}

function unsupportedQuantification(claim, matches) {
  const claimNumbers = claim.match(/\b\d+(?:\.\d+)?%?\b/g) ?? [];
  if (!claimNumbers.length) return false;
  const evidence = matches.map((match) => match.artifact.proof).join(" ");
  return claimNumbers.some((number) => !evidence.includes(number));
}

export function compileProofToInterview(input) {
  const validated = validateProofCompiler(input);
  if (Object.keys(validated.errors).length) return { errors: validated.errors, claims: [], taskMap: [], resumeBullets: [], starAnswer: "", evidencePacket: "", gapDrill: "" };
  const claimResults = validated.claims.map((claim) => {
    const matches = artifactMatches(claim, validated.artifacts);
    const absolute = /\b(?:expert|mastered|flawless|guaranteed|best|perfect)\b/i.test(claim);
    const unsupportedMetric = unsupportedQuantification(claim, matches);
    const status = absolute || unsupportedMetric ? "do-not-claim" : matches.length ? "backed" : "needs-evidence";
    const reason = absolute ? "Absolute proficiency language is not supportable from a bounded project artifact."
      : unsupportedMetric ? "A numeric result is absent from the cited artifact descriptions and supplied outcome."
        : matches.length ? "Artifact language directly overlaps the claim." : "No artifact description provides two meaningful matching terms.";
    return { claim, status, reason, citations: matches.map((match) => match.artifact.id) };
  });
  const taskMap = validated.tasks.map((task) => {
    const matches = artifactMatches(task, validated.artifacts);
    return { task, status: matches.length ? "backed" : "needs-evidence", citations: matches.map((match) => match.artifact.id) };
  });
  const resumeBullets = claimResults.filter((claim) => claim.status === "backed")
    .map((claim) => `${claim.claim.replace(/[.!]+$/, "")}. [${claim.citations.join(", ")}]`);
  const actionCitations = artifactMatches(input.action, validated.artifacts).map((match) => match.artifact.id);
  const outcomeCitations = artifactMatches(input.outcome, validated.artifacts).map((match) => match.artifact.id);
  const actionCitationText = actionCitations.length ? ` [${actionCitations.join(", ")}]` : " [evidence still required]";
  const outcomeCitationText = outcomeCitations.length ? ` [${outcomeCitations.join(", ")}]` : " [evidence still required]";
  const starAnswer = [
    `Situation: ${input.situation.trim()}`,
    `Task: ${validated.tasks[0]}`,
    `Action: ${input.action.trim()}${actionCitationText}`,
    `Result: ${input.outcome.trim()}${outcomeCitationText}`
  ].join("\n");
  const evidencePacket = formatEvidencePacket(input, validated.artifacts, claimResults, taskMap, resumeBullets, starAnswer);
  const gap = claimResults.find((claim) => claim.status !== "backed") ?? taskMap.find((task) => task.status !== "backed");
  const gapText = gap?.claim ?? gap?.task ?? "Ask a reviewer to reproduce one backed claim from its cited artifact.";
  const gapDrill = `Gap drill: ${gapText}\nBuild or improve one code, test, report, or demo artifact that directly demonstrates this statement. Record what was tested, expected, observed, and limited; do not publish the claim until a reviewer can trace it to that artifact.`;
  return { errors: {}, claims: claimResults, taskMap, resumeBullets, starAnswer, evidencePacket, gapDrill };
}

export function formatEvidencePacket(input, artifacts, claims, taskMap, bullets, starAnswer) {
  return [
    "INTERVIEW EVIDENCE PACKET",
    `Target role: ${input.targetRole.trim()}`,
    "NICE-aligned target task evidence map:",
    ...taskMap.map((item) => `- ${item.status.toUpperCase()}: ${item.task}${item.citations.length ? ` [${item.citations.join(", ")}]` : " [no citation]"}`),
    "Claim ledger:",
    ...claims.map((item) => `- ${item.status.toUpperCase()}: ${item.claim}${item.citations.length ? ` [${item.citations.join(", ")}]` : " [withheld]"}`),
    "Citation-bearing resume bullets:",
    ...(bullets.length ? bullets.map((bullet) => `- ${bullet}`) : ["- No bullet released; add evidence first."]),
    "STAR answer:",
    starAnswer,
    "Artifacts to bring:",
    ...artifacts.map((artifact) => `- ${artifact.id} (${artifact.type}): ${artifact.proof}`),
    "Boundary: artifact IDs are local citations, not links. No metric, employer, outcome, or hiring promise was added by the compiler."
  ].join("\n");
}

export { MAX_ARTIFACTS, MAX_CLAIMS, MAX_TASKS };
