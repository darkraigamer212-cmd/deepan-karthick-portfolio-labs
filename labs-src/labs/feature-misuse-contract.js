const MAX_BOUNDARIES = 8;
const MAX_ROLES = 8;

export const DATA_CATEGORIES = Object.freeze({
  none: "No sensitive data / public data only",
  identity: "Identity and profile data",
  contact: "Contact information",
  payment: "Payment or billing data",
  health: "Health-related data",
  credentials: "Credentials, tokens, or recovery data",
  confidential: "Confidential business data"
});

export const MISUSE_EXAMPLE = Object.freeze({
  promise: "Workspace owners can invite teammates to the billing portal without exposing invoices or account details to the wrong workspace.",
  actorRoles: "Workspace owner, Billing admin, Member, Support agent",
  dataCategories: ["identity", "contact", "payment"],
  boundaries: [
    { from: "Customer browser", to: "Invite API", action: "Create and resend a workspace invitation" },
    { from: "Invite API", to: "Identity service", action: "Validate session and workspace role" },
    { from: "Billing API", to: "Billing database", action: "Read workspace invoices and payment status" }
  ]
});

export const MISUSE_RESET = Object.freeze({
  promise: "",
  actorRoles: "",
  dataCategories: [],
  boundaries: [{ from: "", to: "", action: "" }]
});

export const OWASP_REFERENCES = Object.freeze([
  {
    title: "OWASP Top 10:2021",
    url: "https://owasp.org/Top10/"
  },
  {
    title: "OWASP Abuse Case Cheat Sheet",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html"
  },
  {
    title: "OWASP Threat Modeling Project",
    url: "https://owasp.org/www-project-threat-modeling/"
  },
  {
    title: "OWASP Web Security Testing Guide",
    url: "https://owasp.org/www-project-web-security-testing-guide/"
  }
]);

const CATEGORIES = Object.freeze({
  access: { id: "A01:2021", title: "Broken Access Control", url: "https://owasp.org/Top10/en/A01_2021-Broken_Access_Control/" },
  crypto: { id: "A02:2021", title: "Cryptographic Failures", url: "https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/" },
  injection: { id: "A03:2021", title: "Injection", url: "https://owasp.org/Top10/A03_2021-Injection/" },
  design: { id: "A04:2021", title: "Insecure Design", url: "https://owasp.org/Top10/A04_2021-Insecure_Design/" },
  config: { id: "A05:2021", title: "Security Misconfiguration", url: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/" },
  auth: { id: "A07:2021", title: "Identification and Authentication Failures", url: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/" },
  integrity: { id: "A08:2021", title: "Software and Data Integrity Failures", url: "https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/" },
  logging: { id: "A09:2021", title: "Security Logging and Monitoring Failures", url: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/" },
  ssrf: { id: "A10:2021", title: "Server-Side Request Forgery", url: "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/" }
});

export function parseActorRoles(input) {
  return [...new Set(String(input ?? "").split(/[,\n]/u).map((role) => role.trim()).filter(Boolean))];
}

function textLengthError(value, minimum, maximum, label) {
  const text = String(value ?? "").trim();
  if (text.length < minimum) return `${label} must be at least ${minimum} characters.`;
  if (text.length > maximum) return `${label} must be ${maximum} characters or fewer.`;
  return "";
}

export function validateMisuseInput(input) {
  const errors = {};
  const promiseError = textLengthError(input?.promise, 25, 320, "Customer promise");
  if (promiseError) errors.promise = promiseError;

  const roles = parseActorRoles(input?.actorRoles);
  if (roles.length < 2) errors.actorRoles = "List at least two actor roles, separated by commas or new lines.";
  else if (roles.length > MAX_ROLES) errors.actorRoles = `Use ${MAX_ROLES} actor roles or fewer.`;
  else if (roles.some((role) => role.length > 60)) errors.actorRoles = "Keep every actor role at 60 characters or fewer.";

  const dataCategories = Array.isArray(input?.dataCategories) ? [...new Set(input.dataCategories)] : [];
  if (dataCategories.length === 0) errors.dataCategories = "Choose the data handled by the feature, including 'no sensitive data' when applicable.";
  else if (dataCategories.some((category) => !Object.hasOwn(DATA_CATEGORIES, category))) errors.dataCategories = "Choose only supported data categories.";
  else if (dataCategories.includes("none") && dataCategories.length > 1) errors.dataCategories = "Do not combine 'no sensitive data' with sensitive categories.";

  const boundaries = Array.isArray(input?.boundaries) ? input.boundaries : [];
  if (boundaries.length < 1) errors.boundaries = "Add at least one trust-boundary action.";
  else if (boundaries.length > MAX_BOUNDARIES) errors.boundaries = `Use ${MAX_BOUNDARIES} trust-boundary actions or fewer.`;
  else {
    const invalidIndex = boundaries.findIndex((boundary) => (
      textLengthError(boundary?.from, 2, 80, "Boundary source")
      || textLengthError(boundary?.to, 2, 80, "Boundary destination")
      || textLengthError(boundary?.action, 5, 140, "Boundary action")
    ));
    if (invalidIndex >= 0) errors.boundaries = `Complete source, destination, and action for boundary row ${invalidIndex + 1} within the stated limits.`;
  }
  return errors;
}

function containsAny(text, words) {
  const normalized = text.toLocaleLowerCase("en");
  return words.some((word) => normalized.includes(word));
}

function firstBoundary(input) {
  return input.boundaries[0];
}

function candidateStories(input, roles) {
  const boundary = firstBoundary(input);
  const leastPrivilegedRole = roles[roles.length - 1];
  const privilegedRole = roles[0];
  const actionSummary = input.boundaries.map((item) => item.action).join("; ");
  const boundarySummary = input.boundaries.map((item) => `${item.from} to ${item.to}`).join("; ");
  const hasSensitiveData = !input.dataCategories.includes("none");
  const integrityAction = containsAny(actionSummary, ["upload", "import", "update", "publish", "approve", "invite", "deploy", "webhook", "file"]);
  const remoteAction = containsAny(actionSummary, ["url", "webhook", "fetch", "remote", "callback", "import feed"]);

  const stories = [
    {
      key: "access",
      score: 100,
      category: CATEGORIES.access,
      promiseBroken: `${input.promise} The promise breaks if ${leastPrivilegedRole} can perform an action reserved for ${privilegedRole} or access another customer's record.`,
      scenario: `${leastPrivilegedRole} uses the normal feature interface to request ${boundary.action} for a record outside that actor's ownership or role.`,
      test: `Create fixtures for ${privilegedRole} and ${leastPrivilegedRole}; ask the lower-privilege fixture to perform the protected action on an unowned record.`,
      passCondition: "The server denies the action, returns no protected record content, preserves the record, and records an authorization-denial event.",
      owner: "Backend feature owner",
      evidence: "Automated negative authorization test plus approved role/action matrix."
    },
    {
      key: "auth",
      score: 92,
      category: CATEGORIES.auth,
      promiseBroken: `${input.promise} The promise breaks if an expired, revoked, or wrong-workspace session remains trusted.`,
      scenario: `A test actor starts ${boundary.action}, then the test fixture expires or revokes that actor's session before the protected step completes.`,
      test: "Run the protected action with an expired session and again after an administrator revokes the test session.",
      passCondition: "Both requests are rejected, no state changes, and re-authentication is required without revealing account details.",
      owner: "Identity owner",
      evidence: "Session-revocation integration test and authentication policy reference."
    },
    {
      key: "design",
      score: 88,
      category: CATEGORIES.design,
      promiseBroken: `${input.promise} The promise breaks if repeated or out-of-order use bypasses the intended business rule.`,
      scenario: `A legitimate ${privilegedRole} repeats or reorders ${boundary.action} using the documented interface.`,
      test: "Submit the same valid test action twice and submit a later workflow step before its prerequisite is complete.",
      passCondition: "The feature produces at most one intended state change, rejects invalid ordering, and leaves an observable, internally consistent state.",
      owner: "Product and feature owner",
      evidence: "Idempotency/workflow negative tests and documented business invariants."
    },
    {
      key: "injection",
      score: 82,
      category: CATEGORIES.injection,
      promiseBroken: `${input.promise} The promise breaks if unexpected text is interpreted as a command or changes a query rather than remaining data.`,
      scenario: `A test actor enters boundary-length text containing reserved punctuation into each user-controlled field involved in ${boundary.action}.`,
      test: "Use safe non-executable test strings with reserved punctuation, Unicode, empty values, and maximum allowed length across each input field.",
      passCondition: "Inputs are rejected or stored as inert data according to the field contract; no unrelated records change and no internal error detail is returned.",
      owner: "Backend feature owner",
      evidence: "Parameterized data-access review and automated input-boundary tests."
    },
    {
      key: "logging",
      score: 76,
      category: CATEGORIES.logging,
      promiseBroken: `${input.promise} The promise breaks if denied or sensitive actions cannot be reconstructed without exposing protected values in logs.`,
      scenario: `The test suite performs one allowed and one denied ${boundary.action} across ${boundary.from} and ${boundary.to}.`,
      test: "Inspect the test environment's audit event for the allowed and denied cases using approved test identities.",
      passCondition: "Events contain actor, action, object reference, outcome, and correlation identifier; sensitive field values and credentials are absent.",
      owner: "Operations and observability owner",
      evidence: "Redacted sample audit events plus an automated log-field assertion."
    }
  ];

  if (hasSensitiveData) {
    const handledData = input.dataCategories.map((key) => DATA_CATEGORIES[key]).join(", ");
    stories.push({
      key: "crypto",
      score: 96,
      category: CATEGORIES.crypto,
      promiseBroken: `${input.promise} The promise breaks if ${handledData.toLocaleLowerCase("en")} appears in an unapproved response, log, cache, or storage path.`,
      scenario: `A permitted test actor completes ${boundary.action} while observers inspect only approved test records across ${boundarySummary}.`,
      test: "Trace an approved synthetic record through response, log, cache, backup, and storage evidence defined by the team.",
      passCondition: "Only the minimum approved fields appear, protected paths meet the team's documented encryption/retention requirements, and secrets are absent from client-visible output.",
      owner: "Security and data owner",
      evidence: "Data-flow review, synthetic-record trace, and approved protection/retention policy."
    });
  } else {
    stories.push({
      key: "config",
      score: 68,
      category: CATEGORIES.config,
      promiseBroken: `${input.promise} The promise breaks if a non-production or diagnostic setting exposes the feature outside its intended audience.`,
      scenario: `The release candidate starts with the documented production configuration while the tester checks ${boundarySummary}.`,
      test: "Assert that debug responses, sample accounts, unnecessary methods, and non-production feature switches are disabled in the release configuration.",
      passCondition: "The release exposes only documented routes and methods, returns generic errors, and contains no enabled sample or diagnostic access path.",
      owner: "Platform owner",
      evidence: "Release-configuration assertion and reviewed environment manifest."
    });
  }

  if (remoteAction) {
    stories.push({
      key: "ssrf",
      score: 86,
      category: CATEGORIES.ssrf,
      promiseBroken: `${input.promise} The promise breaks if a remote-resource action can reach a destination outside the feature's approved policy.`,
      scenario: "A test actor chooses an unapproved destination from a controlled test list for the remote-resource action.",
      test: "Submit approved and unapproved controlled destinations without contacting any real third-party or internal target.",
      passCondition: "Only approved destination schemes and hosts are accepted; redirects are revalidated, the denied attempt makes no outbound request, and the denial is logged.",
      owner: "Backend and security owner",
      evidence: "Outbound-policy unit/integration test using a local fake endpoint and approved destination policy."
    });
  } else if (integrityAction) {
    stories.push({
      key: "integrity",
      score: 80,
      category: CATEGORIES.integrity,
      promiseBroken: `${input.promise} The promise breaks if altered, stale, or unapproved content is accepted as trusted input.`,
      scenario: `A controlled test fixture changes approved metadata between validation and completion of ${boundary.action}.`,
      test: "Use a benign fixture with deliberately mismatched version, digest, or approval state at the final trust boundary.",
      passCondition: "The feature rejects the stale or mismatched fixture, performs no partial state change, and records which integrity check failed.",
      owner: "Integration or release owner",
      evidence: "Integrity/version negative test and documented trust-source policy."
    });
  }
  return stories;
}

function buildAcceptanceContract(input, roles, stories, assumptions) {
  const lines = [
    "FEATURE MISUSE ACCEPTANCE CONTRACT",
    "",
    `Customer promise: ${input.promise}`,
    `Actor roles: ${roles.join(", ")}`,
    `Data categories: ${input.dataCategories.map((key) => DATA_CATEGORIES[key]).join(", ")}`,
    "Trust-boundary actions:",
    ...input.boundaries.map((boundary, index) => `- TB${index + 1}: ${boundary.from} -> ${boundary.to} | ${boundary.action}`),
    "",
    "PR merge conditions — every checked item needs linked evidence:"
  ];
  for (const story of stories) {
    lines.push(
      `- [ ] ${story.id} ${story.priority} — ${story.category.id} ${story.category.title}`,
      `      Safe negative test: ${story.test}`,
      `      Observable pass: ${story.passCondition}`,
      `      Owner: ${story.owner}`,
      `      Evidence: ${story.evidence}`
    );
  }
  lines.push(
    "",
    "Assumptions to confirm:",
    ...assumptions.map((assumption) => `- [ ] ${assumption}`),
    "",
    "Limits: This contract does not scan or exploit a system, handle credentials, target URLs, calculate CVSS, or prove the absence of vulnerabilities. Review it when roles, data flows, dependencies, or the feature promise change."
  );
  return lines.join("\n");
}

export function buildFeatureMisuseContract(rawInput) {
  const errors = validateMisuseInput(rawInput);
  if (Object.keys(errors).length) return { valid: false, errors };

  const input = {
    promise: rawInput.promise.trim(),
    actorRoles: rawInput.actorRoles,
    dataCategories: [...new Set(rawInput.dataCategories)],
    boundaries: rawInput.boundaries.map((boundary) => ({
      from: boundary.from.trim(),
      to: boundary.to.trim(),
      action: boundary.action.trim()
    }))
  };
  const roles = parseActorRoles(input.actorRoles);
  const candidates = candidateStories(input, roles)
    .sort((left, right) => right.score - left.score || left.key.localeCompare(right.key))
    .slice(0, 7);
  const stories = candidates.map((story, index) => ({
    ...story,
    id: `MISUSE-${String(index + 1).padStart(2, "0")}`,
    priority: index < 2 ? "P1" : index < 5 ? "P2" : "P3"
  }));
  const assumptions = [
    "The actor-role list reflects server-enforced privileges, not only labels shown in the interface.",
    "The boundary rows include every component that reads, changes, forwards, or logs protected feature data.",
    "All acceptance tests use synthetic records and controlled local or test-environment dependencies.",
    "Control owners will attach reviewable evidence to the pull request before marking an item complete."
  ];
  const result = {
    valid: true,
    errors: {},
    input,
    roles,
    stories,
    assumptions,
    references: OWASP_REFERENCES,
    limits: "Design-time planning only: no scanning, exploitation, credentials, attack code, CVSS scoring, or target URL testing. Categories guide conversation and do not establish vulnerability coverage."
  };
  result.acceptanceContract = buildAcceptanceContract(input, roles, stories, assumptions);
  return result;
}

export const misuseLimits = Object.freeze({ maxBoundaries: MAX_BOUNDARIES, maxRoles: MAX_ROLES });
