const MAX_RECIPIENT_ROLES = 12;
const ACCESS_MODES = new Set(["specific", "organization", "anyone"]);
const PERMISSIONS = new Set(["view", "edit"]);
const CLASSIFICATIONS = new Set(["internal", "confidential", "restricted"]);

export const SHARE_AFTERLIFE_EXAMPLE = {
  artifactLabel: "Quarterly supplier pricing review",
  classification: "confidential",
  recipientRows: "Procurement reviewer|Check pricing assumptions|view|7\nFinance approver|Approve the final recommendation|edit|10",
  accessMode: "organization",
  permission: "edit",
  expiryDays: 30,
  residue: {
    download: true,
    copy: true,
    screenshot: true,
    cache: false,
    forwardedNotification: true
  }
};

function containsForbiddenIdentifier(value) {
  return /(?:https?:\/\/|www\.|@|[?&](?:token|key)=)/i.test(String(value));
}

export function parseRecipientRoles(text) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = [];
  const errors = [];
  const names = new Set();
  if (!lines.length) errors.push("Add at least one generic recipient role.");
  if (lines.length > MAX_RECIPIENT_ROLES) errors.push(`Use at most ${MAX_RECIPIENT_ROLES} recipient roles.`);
  lines.slice(0, MAX_RECIPIENT_ROLES).forEach((line, index) => {
    const [role, need, permission, daysText, ...extra] = line.split("|").map((part) => part.trim());
    if (!role || !need || !permission || !daysText || extra.length) {
      errors.push(`Row ${index + 1}: use role|business need|view/edit|required days.`);
      return;
    }
    if (containsForbiddenIdentifier(role) || containsForbiddenIdentifier(need)) errors.push(`Row ${index + 1}: use generic roles and needs; do not enter identities, URLs, or tokens.`);
    if (role.length > 60 || need.length > 160) errors.push(`Row ${index + 1}: role or business need is too long.`);
    const key = role.toLowerCase();
    if (names.has(key)) errors.push(`Row ${index + 1}: duplicate role “${role}”.`);
    names.add(key);
    if (!PERMISSIONS.has(permission)) errors.push(`Row ${index + 1}: permission must be view or edit.`);
    const requiredDays = Number(daysText);
    if (!Number.isInteger(requiredDays) || requiredDays < 1 || requiredDays > 365) errors.push(`Row ${index + 1}: required days must be 1–365.`);
    if (!containsForbiddenIdentifier(role) && !containsForbiddenIdentifier(need) && role.length <= 60 && need.length <= 160 && PERMISSIONS.has(permission) && Number.isInteger(requiredDays) && requiredDays >= 1 && requiredDays <= 365) {
      rows.push({ role, need, permission, requiredDays });
    }
  });
  return { rows, errors };
}

export function validateShareAfterlife(input = {}) {
  const errors = {};
  const label = String(input.artifactLabel ?? "").trim();
  if (label.length < 5 || label.length > 100) errors.artifactLabel = "Use a generic artifact label from 5 to 100 characters.";
  if (containsForbiddenIdentifier(label)) errors.artifactLabel = "Do not enter a URL, identity, token, or provider link.";
  if (!CLASSIFICATIONS.has(input.classification)) errors.classification = "Choose internal, confidential, or restricted.";
  if (!ACCESS_MODES.has(input.accessMode)) errors.accessMode = "Choose a provider access mode.";
  if (!PERMISSIONS.has(input.permission)) errors.permission = "Choose view or edit.";
  const expiryDays = Number(input.expiryDays);
  if (!Number.isInteger(expiryDays) || expiryDays < 1 || expiryDays > 365) errors.expiryDays = "Expiry must be 1–365 whole days.";
  const parsed = parseRecipientRoles(input.recipientRows);
  if (parsed.errors.length) errors.recipientRows = parsed.errors;
  const residue = input.residue ?? {};
  for (const capability of ["download", "copy", "screenshot", "cache", "forwardedNotification"]) {
    if (typeof residue[capability] !== "boolean") errors.residue = "Confirm every residue capability as present or absent.";
  }
  return { errors, recipients: parsed.rows };
}

function ledgerItem(kind, residue, revocable, owner, evidence) {
  return { kind, residue, revocable, owner, evidence };
}

export function rehearseShareAfterlife(input) {
  const validated = validateShareAfterlife(input);
  if (Object.keys(validated.errors).length) return { errors: validated.errors, decision: null, ledger: [], verification: [], contract: "" };
  const recipients = validated.recipients;
  const neededPermission = recipients.some((recipient) => recipient.permission === "edit") ? "edit" : "view";
  const neededDays = Math.max(...recipients.map((recipient) => recipient.requiredDays));
  const residue = input.residue;
  const nonRevocableCount = [residue.download, residue.copy, true, residue.cache].filter(Boolean).length;
  const accessTooWide = input.accessMode !== "specific";
  const permissionTooWide = input.permission === "edit" && neededPermission === "view";
  const expiryTooLong = Number(input.expiryDays) > neededDays;
  const expiryTooShort = Number(input.expiryDays) < neededDays;

  let gate = "proceed-after-corrections";
  let gateReason = "Apply the minimum-access changes and complete the pre-share contract before sharing.";
  if (input.classification === "restricted" && (input.accessMode === "anyone" || nonRevocableCount >= 2)) {
    gate = "do-not-share";
    gateReason = "Restricted material plus broad access or recipient-held residue cannot be made revocable by link expiry.";
  } else if ((input.classification === "confidential" && input.accessMode === "anyone") || nonRevocableCount >= 4) {
    gate = "safer-channel";
    gateReason = "The residue profile is too persistent for this link plan; use a controlled review channel or remove sensitive detail.";
  }

  const decision = {
    gate,
    gateReason,
    recommendedAccessMode: "specific",
    recommendedPermission: neededPermission,
    recommendedExpiryDays: Math.min(Number(input.expiryDays), neededDays),
    corrections: [
      accessTooWide ? `Change ${input.accessMode} access to named, specific recipients.` : null,
      permissionTooWide ? "Change edit permission to view-only because no recipient role needs editing." : null,
      expiryTooLong ? `Reduce expiry from ${input.expiryDays} to ${neededDays} days.` : null,
      expiryTooShort ? `The ${input.expiryDays}-day expiry is shorter than a stated ${neededDays}-day need; shorten the work or document a reviewed extension instead of silently renewing.` : null
    ].filter(Boolean)
  };

  const ledger = [
    ledgerItem("Provider access", `${input.accessMode} link with ${input.permission} permission`, "Revocable at provider", "Share owner", "Access list, expiry setting, and post-revocation access test"),
    ledgerItem("Downloaded copy", residue.download ? "Recipient may retain an offline copy" : "Provider download is disabled; verify this setting", residue.download ? "Not revocable" : "Provider-controlled only", "Recipient role owner", "Download-setting screenshot and recipient acknowledgement"),
    ledgerItem("Copied content", residue.copy ? "Text or data may exist in another document" : "Copy is expected to be restricted; external capture remains possible", "Not revocable", "Recipient role owner", "Handling acknowledgement; provider cannot prove deletion"),
    ledgerItem("Screenshot or camera capture", residue.screenshot ? "Screen capture is expected" : "Not selected, but endpoint capture cannot be disproved", "Not revocable", "Recipient role owner", "Policy acknowledgement only; no reliable provider deletion evidence"),
    ledgerItem("Cached preview", residue.cache ? "Browser, app, search, or notification cache may remain" : "No cache is expected; verify previews and indexing", residue.cache ? "Not reliably revocable" : "Verification required", "Platform administrator", "Cache/index search after expiry"),
    ledgerItem("Forwarded notification", residue.forwardedNotification ? "Artifact label or access notice may have been forwarded" : "No forwarding is expected", "Notification metadata is not revocable", "Share owner", "Notification audit where available and recipient acknowledgement")
  ];
  const verification = [
    "Before sharing, verify the provider shows specific recipients, minimum permission, and the agreed expiry—not merely a copied configuration note.",
    "Test the link from an unauthorized account or signed-out session and retain the denial result as evidence.",
    "At expiry, confirm the link is inactive and each recipient's direct access is removed; expiry and revocation may be separate controls.",
    "Repeat signed-out and former-recipient access tests after revocation and record date, tester role, and result.",
    "Search provider previews, indexes, synced folders, and caches where administratively available; record what cannot be inspected.",
    "Ask recipient roles to confirm handling or deletion of copies, while recording that acknowledgement is not technical proof."
  ];
  return { errors: {}, recipients, decision, ledger, verification, contract: formatShareContract(input, recipients, decision, ledger, verification) };
}

export function formatShareContract(input, recipients, decision, ledger, verification) {
  return [
    "PRE-SHARE AND EXPIRY CONTRACT",
    `Artifact label: ${input.artifactLabel.trim()}`,
    `Classification: ${input.classification}`,
    `Gate: ${decision.gate.toUpperCase()} — ${decision.gateReason}`,
    `Minimum provider control: specific recipients / ${decision.recommendedPermission} / ${decision.recommendedExpiryDays} day(s)`,
    "Recipient roles:",
    ...recipients.map((recipient) => `- ${recipient.role}: ${recipient.need}; ${recipient.permission}; ${recipient.requiredDays} day(s)`),
    "Corrections before share:",
    ...(decision.corrections.length ? decision.corrections.map((item) => `- ${item}`) : ["- No control-width correction detected; complete verification anyway."]),
    "Afterlife ledger:",
    ...ledger.map((item) => `- ${item.kind}: ${item.revocable}. Owner: ${item.owner}. Evidence: ${item.evidence}.`),
    "Expiry and revocation verification:",
    ...verification.map((item) => `- ${item}`),
    "Owner approval: ____________________  Expiry evidence date: ____________________"
  ].join("\n");
}

export { MAX_RECIPIENT_ROLES };
