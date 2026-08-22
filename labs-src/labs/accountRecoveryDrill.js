export const RECOVERY_DRILL_SOURCES = Object.freeze([
  Object.freeze({ label: "NIST SP 800-63B: Account recovery", url: "https://pages.nist.gov/800-63-4/sp800-63b.html#account-recovery" }),
  Object.freeze({ label: "FTC: Recover a hacked email or social account", url: "https://consumer.ftc.gov/articles/how-recover-your-hacked-email-or-social-media-account" }),
  Object.freeze({ label: "CISA: Turn on multifactor authentication", url: "https://www.cisa.gov/secure-our-world/turn-mfa" })
]);
export const RECOVERY_SCENARIOS = Object.freeze({ "device-loss": "Primary device lost", "phone-loss": "Phone and mobile number unavailable", "email-loss": "Primary email unavailable" });
export const RECOVERY_DRILL_EXAMPLE = [
  "Family email|critical|authenticator-app|saved-code,backup-device|push",
  "Shared file storage|high|security-key|backup-device,provider-support|email",
  "Event ticketing|medium|sms|recovery-phone|sms"
].join("\n");
export const RECOVERY_DRILL_RESET = "";
const importanceValues = new Set(["low", "medium", "high", "critical"]);
const mfaValues = new Set(["authenticator-app", "security-key", "sms", "passkey", "none"]);
const methodValues = new Set(["saved-code", "backup-device", "recovery-email", "recovery-phone", "recovery-contact", "provider-support"]);
const channelValues = new Set(["email", "sms", "push", "postal", "secondary-email"]);

export function parseRecoveryAccounts(value) {
  const lines = String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean), errors = [], accounts = [];
  if (!lines.length) return { valid: false, errors: ["Enter at least one critical account label and recovery-method row."], accounts: [] };
  if (lines.length > 20) errors.push("Use 20 account rows or fewer in one drill.");
  const labels = new Set();
  lines.forEach((line, index) => {
    const number = index + 1, parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 5) { errors.push(`Line ${number} must contain five pipe-separated fields.`); return; }
    const [label, rawImportance, rawMfa, rawMethods, rawChannel] = parts;
    const importance = rawImportance.toLowerCase(), primaryMfa = rawMfa.toLowerCase(), notificationChannel = rawChannel.toLowerCase();
    const recoveryMethods = rawMethods.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
    if (!label || label.length > 40) errors.push(`Line ${number}: account label must use 1–40 characters.`);
    else if (!/^[A-Za-z][A-Za-z0-9 &()'/-]{0,39}$/.test(label) || /@|https?:|\b\d{6,}\b/i.test(label)) errors.push(`Line ${number}: use a generic account label, not an email, phone number, URL, username, code, or secret.`);
    else if (labels.has(label.toLowerCase())) errors.push(`Line ${number}: account label must be unique.`); else labels.add(label.toLowerCase());
    if (!importanceValues.has(importance)) errors.push(`Line ${number}: importance must be low, medium, high, or critical.`);
    if (!mfaValues.has(primaryMfa)) errors.push(`Line ${number}: primary MFA must be authenticator-app, security-key, sms, passkey, or none.`);
    if (!recoveryMethods.length || recoveryMethods.some((method) => !methodValues.has(method))) errors.push(`Line ${number}: use only supported recovery method categories.`);
    if (!channelValues.has(notificationChannel)) errors.push(`Line ${number}: notification channel must be email, sms, push, postal, or secondary-email.`);
    accounts.push({ id: `account-${number}`, label, importance, primaryMfa, recoveryMethods: [...new Set(recoveryMethods)], notificationChannel });
  });
  return { valid: errors.length === 0, errors, accounts: errors.length ? [] : accounts };
}

function unavailableForScenario(scenario) {
  if (scenario === "device-loss") return new Set(["authenticator-app", "passkey", "push"]);
  if (scenario === "phone-loss") return new Set(["authenticator-app", "sms", "push", "recovery-phone"]);
  return new Set(["email", "secondary-email", "recovery-email"]);
}

export function composeRecoveryDrill(value, selectedScenarios) {
  const parsed = parseRecoveryAccounts(value);
  const scenarios = Array.isArray(selectedScenarios) ? [...new Set(selectedScenarios)] : [];
  const scenarioErrors = !scenarios.length ? ["Select at least one loss scenario."] : scenarios.some((item) => !Object.hasOwn(RECOVERY_SCENARIOS, item)) ? ["Choose only supported loss scenarios."] : [];
  const errors = [...parsed.errors, ...scenarioErrors];
  if (errors.length) return { valid: false, errors, findings: [], drillSteps: [], emergencyCards: [], sources: RECOVERY_DRILL_SOURCES };
  const findings = [], emergencyCards = [];
  for (const account of parsed.accounts) {
    for (const scenario of scenarios) {
      const unavailable = unavailableForScenario(scenario);
      const surviving = account.recoveryMethods.filter((method) => !unavailable.has(method));
      const primaryLost = unavailable.has(account.primaryMfa), notificationLost = unavailable.has(account.notificationChannel);
      if (primaryLost && !surviving.length) findings.push({ id: `${account.id}-${scenario}-single`, severity: "critical", account: account.label, scenario, issue: "Correlated recovery single point", detail: "The primary MFA and every declared recovery method are unavailable in this scenario.", action: "Add and verify a recovery method that does not depend on the same device, phone, or email channel." });
      if (notificationLost) findings.push({ id: `${account.id}-${scenario}-notify`, severity: "high", account: account.label, scenario, issue: "Recovery notification gap", detail: "The declared notification channel is unavailable during this scenario.", action: "Add or verify an independent notification channel supported by the provider." });
      emergencyCards.push({ id: `${account.id}-${scenario}`, account: account.label, importance: account.importance, scenario: RECOVERY_SCENARIOS[scenario], unavailable: [...unavailable].filter((item) => item === account.primaryMfa || account.recoveryMethods.includes(item) || item === account.notificationChannel), survivingMethods: surviving, firstAction: "From a known-safe device, locate the provider's official recovery page or support route; do not use links from unexpected messages.", notificationCheck: notificationLost ? "Independent notification channel needed" : `Verify the ${account.notificationChannel} category receives the provider's test notification.` });
    }
  }
  const criticalAccounts = parsed.accounts.filter((account) => ["critical", "high"].includes(account.importance));
  for (const method of methodValues) {
    const dependent = criticalAccounts.filter((account) => account.recoveryMethods.includes(method));
    if (dependent.length >= 2) findings.push({ id: `shared-${method}`, severity: "medium", account: dependent.map((item) => item.label).join(", "), scenario: "cross-account", issue: "Shared recovery dependency", detail: `${dependent.length} important accounts rely on the ${method} category.`, action: "Confirm one failure cannot remove this method for every important account; diversify where providers allow." });
  }
  const drillSteps = [
    "Assign a facilitator and state that this is a tabletop drill: do not start a real recovery or enter a code.",
    "Read one loss scenario and mark only the declared methods/channels that become unavailable.",
    "For each account, name the surviving method category without revealing its secret, address, or stored location publicly.",
    "From a safe device, verify the provider's official recovery/support route is findable; stop before submitting anything.",
    "Confirm recovery-event notifications would reach an independent channel and identify who reviews them.",
    "Record gaps, assign an owner and due date, then schedule a separate authorized verification.",
    "End the drill by confirming nobody disclosed or changed a password, recovery code, key, phone number, email address, or secret answer."
  ];
  const checklist = ["Two separate authentication/recovery means are documented where the provider supports them.", "Saved recovery material is referenced only by category and stored offline/securely—not copied into this drill.", "Lost or compromised authenticators have a provider-approved invalidation path.", "Recovery notifications use more than the failed channel where supported.", "Provider recovery information was reached from an official bookmarked or manually verified route.", "Every gap has a named owner and review date."];
  const nextActions = [...new Map(findings.map((finding) => [`${finding.account}-${finding.action}`, { owner: "Account owner or team security coordinator", account: finding.account, action: finding.action, evidence: "Provider settings reviewed without recording any secret; dated owner confirmation" }])).values()];
  return { valid: true, errors: [], accounts: parsed.accounts, findings, drillSteps, checklist, emergencyCards, nextActions, sources: RECOVERY_DRILL_SOURCES, limitation: "This defensive local tabletop uses category labels only. It never contacts a provider, validates real access, performs recovery, or stores usernames, addresses, passwords, codes, secret answers, or keys. Follow each provider's official process and involve an authorized security owner." };
}
