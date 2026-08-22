export const CONTAINMENT_SOURCES = Object.freeze([
  Object.freeze({ label: "NIST SP 800-61 Rev. 3: Incident response recommendations", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" })
]);
export const CONTAINMENT_EXAMPLE = Object.freeze({
  alertClaim: "Unusual sign-in failures may indicate misuse of the customer support portal.",
  affectedPromise: "Customers can sign in and reach support during business hours.",
  evidenceRows: "Failure rate increased after 09:00|application|high\nIdentity provider shows matching failures|identity|medium\nSupport team received access complaints|customer-report|medium",
  actionRows: "Temporarily require step-up verification|reversible|medium|Identity lead\nDisable all customer sign-ins|partial|high|Incident commander\nDelete affected accounts|irreversible|high|Executive incident owner"
});
export const CONTAINMENT_RESET = Object.freeze({ alertClaim: "", affectedPromise: "", evidenceRows: "", actionRows: "" });
const sourceCategories = new Set(["endpoint", "identity", "application", "network", "customer-report", "change-record"]);
const confidenceValues = new Set(["low", "medium", "high"]);
const reversibilityValues = new Set(["reversible", "partial", "irreversible"]);
const harmValues = new Set(["low", "medium", "high"]);

function metadataSafetyError(value) {
  const text = String(value);
  if (/https?:\/\/|www\.|\b(?:\d{1,3}\.){3}\d{1,3}\b|\b[a-f0-9]{32,}\b|-----BEGIN|\b(?:password|token|api[_ -]?key|secret)\s*[:=]/i.test(text)) return true;
  if (/\b(?:select\s+.+\s+from|curl\s|powershell\s|invoke-webrequest|<script|\.\.\/|(?:rm|del)\s+[-/])/i.test(text)) return true;
  return false;
}

function validateNarrative(value, label, maximum, errors) {
  const text = String(value ?? "").trim();
  if (!text) errors.push(`${label} is required.`);
  else if (text.length > maximum) errors.push(`${label} must be ${maximum} characters or fewer.`);
  else if (metadataSafetyError(text)) errors.push(`${label} must contain high-level defensive metadata only; remove URLs, credentials, indicators, payloads, queries, or command steps.`);
  return text;
}

function parseEvidence(value, errors) {
  const lines = String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) { errors.push("Enter at least one evidence row."); return []; }
  if (lines.length > 20) errors.push("Use 20 evidence rows or fewer.");
  return lines.map((line, index) => {
    const number = index + 1, parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 3) { errors.push(`Evidence line ${number} must contain three pipe-separated fields.`); return null; }
    const [fact, rawSource, rawConfidence] = parts, source = rawSource.toLowerCase(), confidence = rawConfidence.toLowerCase();
    if (!fact || fact.length > 160 || metadataSafetyError(fact)) errors.push(`Evidence line ${number}: fact must be 1–160 characters of defensive metadata only.`);
    if (!sourceCategories.has(source)) errors.push(`Evidence line ${number}: choose a supported source category.`);
    if (!confidenceValues.has(confidence)) errors.push(`Evidence line ${number}: confidence must be low, medium, or high.`);
    return { id: `evidence-${number}`, fact, source, confidence };
  }).filter(Boolean);
}

function parseActions(value, errors) {
  const lines = String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) { errors.push("Enter at least one candidate action row."); return []; }
  if (lines.length > 12) errors.push("Use 12 candidate actions or fewer.");
  return lines.map((line, index) => {
    const number = index + 1, parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 4) { errors.push(`Action line ${number} must contain four pipe-separated fields.`); return null; }
    const [action, rawReversibility, rawHarm, owner] = parts, reversibility = rawReversibility.toLowerCase(), serviceHarm = rawHarm.toLowerCase();
    if (!action || action.length > 120 || metadataSafetyError(action)) errors.push(`Action line ${number}: action must be a high-level defensive label of 1–120 characters.`);
    if (!reversibilityValues.has(reversibility)) errors.push(`Action line ${number}: reversibility must be reversible, partial, or irreversible.`);
    if (!harmValues.has(serviceHarm)) errors.push(`Action line ${number}: service harm must be low, medium, or high.`);
    if (!owner || owner.length > 60 || /@|https?:|\d{6,}/i.test(owner)) errors.push(`Action line ${number}: owner must be a generic role label of 1–60 characters.`);
    return { id: `action-${number}`, action, reversibility, serviceHarm, owner };
  }).filter(Boolean);
}

export function validateContainmentInput(input) {
  const errors = [];
  const alertClaim = validateNarrative(input?.alertClaim, "Alert claim", 220, errors);
  const affectedPromise = validateNarrative(input?.affectedPromise, "Affected service or customer promise", 180, errors);
  const evidence = parseEvidence(input?.evidenceRows, errors), actions = parseActions(input?.actionRows, errors);
  return { valid: errors.length === 0, errors, alertClaim, affectedPromise, evidence: errors.length ? [] : evidence, actions: errors.length ? [] : actions };
}

function recoveryProof(action, promise) {
  if (action.reversibility === "reversible") return `Record the starting state, test the rollback, and prove “${promise}” works after rollback.`;
  if (action.reversibility === "partial") return `Name what cannot be restored automatically, obtain recovery-owner approval, and prove “${promise}” through a controlled customer check.`;
  return `No automatic rollback exists: require executive/legal authorization, preserved evidence, a reconstruction plan, and independent proof of “${promise}”.`;
}

export function buildContainmentLedger(input) {
  const parsed = validateContainmentInput(input);
  if (!parsed.valid) return { ...parsed, ledger: [], handoff: "", sources: CONTAINMENT_SOURCES };
  const highEvidence = parsed.evidence.filter((item) => item.confidence === "high");
  const sourceCount = new Set(parsed.evidence.map((item) => item.source)).size;
  const evidenceAdequate = highEvidence.length >= 1 && sourceCount >= 2;
  const evidenceGaps = [];
  if (!highEvidence.length) evidenceGaps.push("No high-confidence fact is recorded.");
  if (sourceCount < 2) evidenceGaps.push("Evidence comes from fewer than two source categories.");
  if (!parsed.evidence.some((item) => item.source === "customer-report")) evidenceGaps.push("Customer-visible impact has no customer-report category evidence.");
  if (parsed.evidence.some((item) => item.confidence === "low")) evidenceGaps.push("At least one fact remains low confidence and must not be treated as confirmed.");
  if (!evidenceGaps.length) evidenceGaps.push("No deterministic evidence gap fired; the incident lead must still test the claim and scope.");

  const ledger = parsed.actions.map((action) => {
    let disposition = "reviewable";
    let gate = "Incident lead confirms scope, owner, customer communication, rollback readiness, and authorization before action.";
    if (action.reversibility === "irreversible") {
      disposition = "escalate-only";
      gate = "Blocked from recommendation: irreversible action requires executive, legal, service-owner, and incident-command authorization plus preserved evidence.";
    } else if (action.serviceHarm === "high" && !evidenceAdequate) {
      disposition = "blocked";
      gate = "Blocked: collect at least one high-confidence fact across at least two source categories before considering this high-harm action.";
    } else if (action.serviceHarm === "high" || action.reversibility === "partial") {
      disposition = "escalate-for-review";
      gate = "Escalate to incident command and the service owner; document accepted customer harm and the recovery owner before action.";
    }
    return {
      ...action,
      disposition,
      customerSideEffect: action.serviceHarm === "high" ? `May substantially break “${parsed.affectedPromise}”.` : action.serviceHarm === "medium" ? `May degrade or delay “${parsed.affectedPromise}”.` : `Expected customer harm is limited, but “${parsed.affectedPromise}” still needs measurement.`,
      evidenceGate: gate,
      evidenceBeforeAction: ["Confirm the alert claim with a named fact and source.", "Capture a pre-action service baseline and decision timestamp.", ...(action.serviceHarm === "high" ? ["Obtain explicit service-owner acceptance of customer harm."] : [])],
      rollbackRecoveryProof: recoveryProof(action, parsed.affectedPromise),
      escalationTrigger: action.reversibility === "irreversible" ? "Any irreversible effect." : action.serviceHarm === "high" ? "High customer/service harm or missing diverse evidence." : "Scope expands, rollback fails, or the customer promise worsens."
    };
  });
  const handoff = `CONTAINMENT SIDE-EFFECT HANDOFF\nTabletop only — no live containment performed\n\nAlert claim: ${parsed.alertClaim}\nCustomer promise at risk: ${parsed.affectedPromise}\nEvidence confidence: ${highEvidence.length} high-confidence fact(s), ${sourceCount} source category/categories\n\nUNCERTAINTY / GAPS\n${evidenceGaps.map((item) => `- ${item}`).join("\n")}\n\nCANDIDATE LEDGER\n${ledger.map((item, index) => `${index + 1}. ${item.action}\n   Disposition: ${item.disposition}\n   Owner: ${item.owner}\n   Side effect: ${item.customerSideEffect}\n   Gate: ${item.evidenceGate}\n   Recovery proof: ${item.rollbackRecoveryProof}\n   Escalate when: ${item.escalationTrigger}`).join("\n\n")}\n\nAnalyst: ____________________\nIncident lead decision: ____________________\nDecision evidence link/location (do not paste secrets): ____________________`;
  return { valid: true, errors: [], alertClaim: parsed.alertClaim, affectedPromise: parsed.affectedPromise, evidence: parsed.evidence, evidenceGaps, ledger, handoff, sources: CONTAINMENT_SOURCES, limitation: "This metadata-only tabletop neither observes an incident nor authorizes or performs containment. It accepts no telemetry, URLs, indicators, payloads, queries, credentials, or executable steps. Follow the organization's incident-response plan and authorized decision chain." };
}

