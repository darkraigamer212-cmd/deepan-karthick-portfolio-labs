export const CHANGE_CATEGORIES = Object.freeze({
  vendor: "Vendor change",
  system: "System change",
  config: "Configuration change",
  owner: "Control or evidence owner change"
});

export const ASSURANCE_EXAMPLE = Object.freeze({
  changeCategory: "vendor",
  changeDescription: "The payroll processor changed its evidence portal and subprocessor ownership model.",
  claimRows: `CLM-01|Payroll exports remain restricted to authorized finance staff|Security lead|90
CLM-02|Employee payroll data stays recoverable after a service disruption|Operations lead|60
CLM-03|Payroll change events can be reconstructed for customer support|Engineering lead|30
CLM-04|Customers receive timely service-status notices|Support lead|90`,
  evidenceRows: `EV-01|CLM-01|Quarterly access review|45|vendor,owner
EV-02|CLM-01|Application authorization test|20|system,config
EV-03|CLM-02|Recovery rehearsal record|75|vendor,system
EV-04|CLM-03|Audit event sample review|40|config,owner
EV-05|CLM-04|Status notification review|10|system`,
  acceptedRiskRows: `RISK-01|CLM-01|14
RISK-02|CLM-02|-3
RISK-03|CLM-04|120`
});

export const ASSURANCE_RESET = Object.freeze({
  changeCategory: "",
  changeDescription: "",
  claimRows: "",
  evidenceRows: "",
  acceptedRiskRows: ""
});

export const ASSURANCE_REFERENCES = Object.freeze([
  {
    title: "NIST SP 800-53A Rev. 5 — Assessing Security and Privacy Controls",
    url: "https://csrc.nist.gov/pubs/sp/800/53/a/r5/final"
  },
  {
    title: "NIST SP 800-137 — Information Security Continuous Monitoring",
    url: "https://csrc.nist.gov/pubs/sp/800/137/final"
  }
]);

const LIMITS = Object.freeze({ claims: 20, evidence: 40, risks: 20 });
const ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{1,31}$/u;
const DISALLOWED_METADATA = /(?:https?:\/\/|www\.|(?:password|passwd|secret|api[_ -]?key|access[_ -]?token)\s*[:=])/iu;

function assertGenericMetadata(text) {
  if (DISALLOWED_METADATA.test(text)) {
    throw new RangeError("Use generic metadata only; remove URLs and credential-like values.");
  }
}

function parseInteger(value, label, minimum, maximum) {
  if (!/^-?\d+$/u.test(value)) throw new TypeError(`${label} must be a whole number.`);
  const parsed = Number(value);
  if (parsed < minimum || parsed > maximum) throw new RangeError(`${label} must be from ${minimum} to ${maximum}.`);
  return parsed;
}

function parseRows(input, expectedCells, maximumRows, rowLabel) {
  const text = String(input ?? "").trim();
  if (!text) return [];
  assertGenericMetadata(text);
  const lines = text.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  if (lines.length > maximumRows) throw new RangeError(`Use ${maximumRows} ${rowLabel} rows or fewer.`);
  return lines.map((line, index) => {
    const cells = line.split("|").map((cell) => cell.trim());
    if (cells.length !== expectedCells || cells.some((cell) => cell === "")) {
      throw new SyntaxError(`${rowLabel} row ${index + 1} must contain exactly ${expectedCells} non-empty pipe-separated fields.`);
    }
    return cells;
  });
}

function assertUniqueIds(rows, rowLabel) {
  const ids = rows.map((row) => row.id.toLocaleLowerCase("en"));
  if (new Set(ids).size !== ids.length) throw new RangeError(`${rowLabel} IDs must be unique, ignoring letter case.`);
}

export function parseClaimRows(input) {
  const rows = parseRows(input, 4, LIMITS.claims, "Claim").map(([id, promise, owner, cadence], index) => {
    if (!ID_PATTERN.test(id)) throw new RangeError(`Claim row ${index + 1} has an invalid claim ID.`);
    if (promise.length < 10 || promise.length > 180) throw new RangeError(`Claim row ${index + 1} promise must be 10–180 characters.`);
    if (owner.length < 2 || owner.length > 60) throw new RangeError(`Claim row ${index + 1} owner must be 2–60 characters.`);
    return { id, promise, owner, cadenceDays: parseInteger(cadence, `Claim row ${index + 1} cadence`, 1, 3650) };
  });
  assertUniqueIds(rows, "Claim");
  return rows;
}

export function parseEvidenceRows(input) {
  const rows = parseRows(input, 5, LIMITS.evidence, "Evidence").map(([id, claimId, type, age, dependencies], index) => {
    if (!ID_PATTERN.test(id)) throw new RangeError(`Evidence row ${index + 1} has an invalid evidence ID.`);
    if (!ID_PATTERN.test(claimId)) throw new RangeError(`Evidence row ${index + 1} has an invalid claim ID.`);
    if (type.length < 3 || type.length > 100) throw new RangeError(`Evidence row ${index + 1} type must be 3–100 characters.`);
    const dependsOn = [...new Set(dependencies.split(",").map((item) => item.trim().toLocaleLowerCase("en")).filter(Boolean))];
    if (dependsOn.length === 0 || dependsOn.some((category) => !Object.hasOwn(CHANGE_CATEGORIES, category))) {
      throw new RangeError(`Evidence row ${index + 1} dependencies must use vendor, system, config, or owner.`);
    }
    return { id, claimId, type, ageDays: parseInteger(age, `Evidence row ${index + 1} age`, 0, 3650), dependsOn };
  });
  assertUniqueIds(rows, "Evidence");
  return rows;
}

export function parseAcceptedRiskRows(input) {
  const rows = parseRows(input, 3, LIMITS.risks, "Accepted-risk").map(([id, claimId, expiry], index) => {
    if (!ID_PATTERN.test(id)) throw new RangeError(`Accepted-risk row ${index + 1} has an invalid risk ID.`);
    if (!ID_PATTERN.test(claimId)) throw new RangeError(`Accepted-risk row ${index + 1} has an invalid claim ID.`);
    return { id, claimId, expiryDays: parseInteger(expiry, `Accepted-risk row ${index + 1} expiry`, -3650, 3650) };
  });
  assertUniqueIds(rows, "Accepted-risk");
  return rows;
}

export function validateAssuranceInput(input) {
  const errors = {};
  if (!Object.hasOwn(CHANGE_CATEGORIES, input?.changeCategory)) errors.changeCategory = "Choose a change category.";
  const description = String(input?.changeDescription ?? "").trim();
  if (description.length < 15 || description.length > 280) errors.changeDescription = "Describe the change in 15–280 characters.";
  else {
    try { assertGenericMetadata(description); } catch (error) { errors.changeDescription = error.message; }
  }

  let claims = [];
  let evidence = [];
  let risks = [];
  try {
    claims = parseClaimRows(input?.claimRows);
    if (claims.length === 0) errors.claimRows = "Add at least one claim row.";
  } catch (error) { errors.claimRows = error.message; }
  try {
    evidence = parseEvidenceRows(input?.evidenceRows);
    if (evidence.length === 0) errors.evidenceRows = "Add at least one evidence row.";
  } catch (error) { errors.evidenceRows = error.message; }
  try { risks = parseAcceptedRiskRows(input?.acceptedRiskRows); } catch (error) { errors.acceptedRiskRows = error.message; }

  if (claims.length) {
    const claimIds = new Set(claims.map((claim) => claim.id.toLocaleLowerCase("en")));
    const unknownEvidence = evidence.find((item) => !claimIds.has(item.claimId.toLocaleLowerCase("en")));
    if (unknownEvidence) errors.evidenceRows = `Evidence ${unknownEvidence.id} references unknown claim ${unknownEvidence.claimId}.`;
    const unknownRisk = risks.find((item) => !claimIds.has(item.claimId.toLocaleLowerCase("en")));
    if (unknownRisk) errors.acceptedRiskRows = `Accepted risk ${unknownRisk.id} references unknown claim ${unknownRisk.claimId}.`;
  }
  return { errors, claims, evidence, risks };
}

function riskDecision(risk, claim) {
  if (risk.expiryDays <= 0) {
    return {
      ...risk,
      status: "expired",
      decision: `Do not rely on this expired acceptance. ${claim.owner} must choose to mitigate, revise, or document a new time-bounded decision.`
    };
  }
  if (risk.expiryDays <= 30) {
    return {
      ...risk,
      status: "due-soon",
      decision: `${claim.owner} must re-evaluate the evidence and record a decision before the ${risk.expiryDays}-day window closes.`
    };
  }
  return {
    ...risk,
    status: "active",
    decision: `Keep the ${risk.expiryDays}-day review point visible; this record does not automatically accept or approve risk.`
  };
}

function buildExecutiveMemo(input, summary, claims, renewalOrder, riskDecisions) {
  const lines = [
    "EXECUTIVE ASSURANCE CHANGE MEMO",
    "",
    `Change: ${CHANGE_CATEGORIES[input.changeCategory]} — ${input.changeDescription}`,
    `Claim impact: ${summary.invalidated} invalidated; ${summary.needsReview} need review; ${summary.current} currently supported by supplied metadata.`,
    "",
    "Renewal order",
    ...renewalOrder.map((item) => `${item.order}. ${item.claimId} [${item.status}] Owner: ${item.owner}. Next evidence: ${item.evidenceNeeded}`),
    "",
    "Accepted-risk decisions",
    ...(riskDecisions.length ? riskDecisions.map((risk) => `- ${risk.id} / ${risk.claimId} [${risk.status}]: ${risk.decision}`) : ["- No accepted-risk rows supplied."]),
    "",
    "Owner action",
    ...claims.filter((claim) => claim.status !== "current").map((claim) => `- ${claim.owner}: re-establish evidence for ${claim.id} and record the review result.`),
    "",
    "Decision boundary",
    "This memo records a change-triggered evidence review. It does not certify compliance, approve an audit, or automatically accept risk."
  ];
  return lines.join("\n");
}

export function mapAssuranceChangeShockwave(input) {
  const parsed = validateAssuranceInput(input);
  if (Object.keys(parsed.errors).length) return { valid: false, errors: parsed.errors };
  const claimLookup = new Map(parsed.claims.map((claim) => [claim.id.toLocaleLowerCase("en"), claim]));

  const evidence = parsed.evidence.map((item) => {
    const claim = claimLookup.get(item.claimId.toLocaleLowerCase("en"));
    const invalidated = item.dependsOn.includes(input.changeCategory);
    const stale = item.ageDays >= claim.cadenceDays;
    const state = invalidated ? "invalidated" : stale ? "needs-review" : "current";
    const reason = invalidated
      ? `Depends on changed category: ${input.changeCategory}.`
      : stale
        ? `Age ${item.ageDays} days reaches or exceeds ${claim.cadenceDays}-day cadence.`
        : `Age ${item.ageDays} days remains inside ${claim.cadenceDays}-day cadence and has no matching change dependency.`;
    return { ...item, claimOwner: claim.owner, cadenceDays: claim.cadenceDays, state, reason };
  });

  const claims = parsed.claims.map((claim) => {
    const linked = evidence.filter((item) => item.claimId.toLocaleLowerCase("en") === claim.id.toLocaleLowerCase("en"));
    const invalidatedEvidence = linked.filter((item) => item.state === "invalidated");
    const reviewEvidence = linked.filter((item) => item.state === "needs-review");
    const status = invalidatedEvidence.length ? "invalidated" : (!linked.length || reviewEvidence.length ? "needs-review" : "current");
    const evidenceNeeded = invalidatedEvidence.length
      ? `Re-establish ${invalidatedEvidence.map((item) => item.type).join(", ")} after the ${input.changeCategory} change.`
      : reviewEvidence.length
        ? `Renew ${reviewEvidence.map((item) => item.type).join(", ")} against the ${claim.cadenceDays}-day cadence.`
        : !linked.length
          ? "Create the first reviewable evidence record for this claim."
          : `Preserve ${linked.map((item) => item.id).join(", ")} and review before its cadence boundary.`;
    const overdueDays = reviewEvidence.length ? Math.max(...reviewEvidence.map((item) => item.ageDays - claim.cadenceDays)) : 0;
    return {
      ...claim,
      status,
      linkedEvidence: linked.map((item) => item.id),
      invalidatedEvidence: invalidatedEvidence.map((item) => item.id),
      reviewEvidence: reviewEvidence.map((item) => item.id),
      overdueDays,
      evidenceNeeded
    };
  });
  const evaluatedClaimLookup = new Map(claims.map((claim) => [claim.id.toLocaleLowerCase("en"), claim]));
  const riskDecisions = parsed.risks.map((risk) => riskDecision(risk, evaluatedClaimLookup.get(risk.claimId.toLocaleLowerCase("en"))));

  const statusRank = { invalidated: 0, "needs-review": 1, current: 2 };
  const riskRank = (claimId) => {
    const linked = riskDecisions.filter((risk) => risk.claimId.toLocaleLowerCase("en") === claimId.toLocaleLowerCase("en"));
    if (linked.some((risk) => risk.status === "expired")) return 0;
    if (linked.some((risk) => risk.status === "due-soon")) return 1;
    return 2;
  };
  const renewalOrder = [...claims].sort((left, right) => (
    statusRank[left.status] - statusRank[right.status]
    || riskRank(left.id) - riskRank(right.id)
    || right.overdueDays - left.overdueDays
    || left.id.localeCompare(right.id)
  )).map((claim, index) => ({
    order: index + 1,
    claimId: claim.id,
    promise: claim.promise,
    owner: claim.owner,
    status: claim.status,
    evidenceNeeded: claim.evidenceNeeded,
    orderingBasis: `${claim.status} first; then expired/due-soon decision; then overdue cadence; then claim ID.`
  }));

  const summary = {
    invalidated: claims.filter((claim) => claim.status === "invalidated").length,
    needsReview: claims.filter((claim) => claim.status === "needs-review").length,
    current: claims.filter((claim) => claim.status === "current").length
  };
  const result = {
    valid: true,
    errors: {},
    change: { category: input.changeCategory, label: CHANGE_CATEGORIES[input.changeCategory], description: input.changeDescription.trim() },
    claims,
    evidence,
    riskDecisions,
    renewalOrder,
    summary,
    assumptions: [
      "Claim, owner, cadence, evidence age, dependency, and accepted-risk expiry metadata are complete and current.",
      "A category match indicates that evidence needs re-establishment; it does not prove the underlying control failed.",
      "Evidence age is measured in whole days using the organization's own documented observation date."
    ],
    limits: "Metadata-only planning output. It does not inspect systems, certify compliance, approve an audit, accept risk, or replace a qualified assessment."
  };
  result.executiveMemo = buildExecutiveMemo(input, summary, claims, renewalOrder, riskDecisions);
  return result;
}

export const assuranceLimits = LIMITS;
