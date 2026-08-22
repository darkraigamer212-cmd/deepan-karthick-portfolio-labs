export const AZURE_ACCESS_SOURCES = Object.freeze([
  Object.freeze({ label: "Azure role-based access control overview", url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/overview" }),
  Object.freeze({ label: "Steps to assign an Azure role", url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-steps" }),
  Object.freeze({ label: "Microsoft Entra access reviews overview", url: "https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview" }),
  Object.freeze({ label: "Microsoft guidance for shared accounts and credentials", url: "https://learn.microsoft.com/en-us/entra/identity/users/users-sharing-accounts" })
]);

export const AZURE_HANDOFF_RESET_INPUT = "";
export const AZURE_HANDOFF_EXAMPLE_INPUT = [
  "Anika|new|frontend developer|resource-group: web-demo|contributor|no|0",
  "Bala|active|support analyst|subscription: startup-prod|reader|yes|120",
  "Chen|role-change|data analyst|resource-group: analytics|owner|no|95",
  "Divya|exiting|operations lead|subscription: startup-prod|owner|yes|180"
].join("\n");

const statuses = new Set(["new", "active", "role-change", "exiting"]);
const privileges = new Set(["reader", "contributor", "owner"]);

export function parseAccessLines(value) {
  const sourceLines = String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  if (!sourceLines.length) return { valid: false, errors: ["Enter at least one access record."], records: [] };
  if (sourceLines.length > 50) errors.push("Use 50 access records or fewer in one handoff rehearsal.");

  const records = [];
  const seenNames = new Set();
  sourceLines.forEach((line, index) => {
    const lineNumber = index + 1;
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 7) {
      errors.push(`Line ${lineNumber} must contain seven pipe-separated fields.`);
      return;
    }
    const [name, status, role, resourceScope, privilegeLevel, sharedCredential, reviewValue] = parts;
    const normalizedStatus = status.toLowerCase();
    const normalizedPrivilege = privilegeLevel.toLowerCase();
    const normalizedShared = sharedCredential.toLowerCase();
    const lastReviewDays = Number(reviewValue);
    if (!name) errors.push(`Line ${lineNumber}: name is required.`);
    else if (seenNames.has(name.toLowerCase())) errors.push(`Line ${lineNumber}: each person name must be unique.`);
    else seenNames.add(name.toLowerCase());
    if (!statuses.has(normalizedStatus)) errors.push(`Line ${lineNumber}: status must be new, active, role-change, or exiting.`);
    if (!role) errors.push(`Line ${lineNumber}: role is required.`);
    if (!resourceScope) errors.push(`Line ${lineNumber}: resource scope is required.`);
    if (!privileges.has(normalizedPrivilege)) errors.push(`Line ${lineNumber}: privilege must be reader, contributor, or owner.`);
    if (!new Set(["yes", "no"]).has(normalizedShared)) errors.push(`Line ${lineNumber}: shared credential must be yes or no.`);
    if (reviewValue === "" || !Number.isInteger(lastReviewDays) || lastReviewDays < 0 || lastReviewDays > 3650) errors.push(`Line ${lineNumber}: last review days must be a whole number from 0 to 3650.`);
    records.push({ id: `access-${lineNumber}`, lineNumber, name, status: normalizedStatus, role, resourceScope, privilegeLevel: normalizedPrivilege, sharedCredential: normalizedShared === "yes", lastReviewDays });
  });
  return { valid: errors.length === 0, errors, records: errors.length ? [] : records };
}
function finding(record, type, severity, summary, action, owner, evidence) {
  return { id: `${record.id}-${type}`, person: record.name, type, severity, summary, action, owner, evidence };
}

export function simulateAzureAccessHandoff(value) {
  const parsed = parseAccessLines(value);
  if (!parsed.valid) return { ...parsed, findings: [], plan: [], checklist: [], checklistText: "", sources: AZURE_ACCESS_SOURCES };
  const findings = [];
  const plan = [];

  for (const record of parsed.records) {
    if (record.status === "exiting") {
      findings.push(finding(record, "orphan-access", "critical", "An exiting person still has a declared access assignment.", "Remove direct and inherited access, then disable or complete the identity offboarding workflow.", "Team manager + identity administrator", "Before/after role-assignment export, offboarding ticket, and blocked sign-in verification"));
      plan.push({ priority: 1, person: record.name, action: "Confirm the exit time; remove Azure resource role assignments and group paths; verify the identity cannot access the declared scope.", owner: "Identity administrator", evidence: "Timestamped offboarding ticket and before/after access evidence" });
    }
    if (record.sharedCredential) {
      findings.push(finding(record, "shared-credential", "critical", "A shared credential weakens individual attribution and may survive a staffing change.", "Identify every holder, rotate the credential, and move to an approved individual or brokered access pattern where feasible.", "Security lead", "Rotation record, holder list, and successful individual-access test"));
      plan.push({ priority: 1, person: record.name, action: "Inventory holders of the shared credential, rotate it during the handoff window, and document the approved replacement pattern.", owner: "Security lead", evidence: "Credential rotation record and named holder confirmation" });
    }

    const broadScope = /(^|\b)(tenant|subscription|all resources|management group)(\b|:)/i.test(record.resourceScope);
    if (record.privilegeLevel === "owner" || broadScope) {
      findings.push(finding(record, "excessive-scope", record.privilegeLevel === "owner" ? "high" : "medium", `${record.privilegeLevel} access at “${record.resourceScope}” requires an explicit least-scope decision.`, "Confirm the exact actions required, then narrow the role or scope instead of copying predecessor access.", "Resource owner + Azure RBAC administrator", "Approved role/scope decision and resulting Azure role assignment"));
      plan.push({ priority: 2, person: record.name, action: `Review ${record.privilegeLevel} access at ${record.resourceScope}; retain only the role and scope justified by the current job.`, owner: "Resource owner", evidence: "Manager justification and exported final role assignment" });
    }
    if (record.lastReviewDays > 90) {
      findings.push(finding(record, "review-drift", record.lastReviewDays > 180 ? "high" : "medium", `Declared access was last reviewed ${record.lastReviewDays} days ago.`, "Run a manager/resource-owner review and record keep, change, or remove with justification.", "Team manager", "Dated review decision, reviewer identity, and applied change evidence"));
      plan.push({ priority: 3, person: record.name, action: `Complete an access review; the supplied record says ${record.lastReviewDays} days since review.`, owner: "Team manager", evidence: "Recorded keep/change/remove decision with justification" });
    }
    if (record.status === "role-change") {
      plan.push({ priority: 2, person: record.name, action: "Define access for the new role, remove obsolete access, and test the new role without cloning the predecessor's privileges.", owner: "Team manager + resource owner", evidence: "Old/new comparison and completed task-based access test" });
    } else if (record.status === "new") {
      plan.push({ priority: 4, person: record.name, action: "Approve the minimum role and resource scope, assign it to the named identity, and test one required task.", owner: "Team manager + Azure RBAC administrator", evidence: "Approval, Azure role assignment, and successful task test" });
    } else if (record.status === "active" && !findings.some((item) => item.person === record.name)) {
      plan.push({ priority: 5, person: record.name, action: "Reconfirm the current role, scope, and business owner; record that no handoff change is required.", owner: "Team manager", evidence: "Dated manager attestation" });
    }
  }

  plan.sort((left, right) => left.priority - right.priority || left.person.localeCompare(right.person) || left.action.localeCompare(right.action));
  const checklist = [
    "Manager: confirm each person's status, current job need, and effective handoff time.",
    "Manager: name a business owner for every retained access path.",
    "Azure administrator: capture role assignments and group-derived access before changes.",
    "Azure administrator: grant only the required role at the narrowest justified scope.",
    "Security: rotate exposed shared credentials and document every remaining holder.",
    "Security: verify exiting identities cannot sign in or exercise the removed access.",
    "Resource owner: test one allowed action and one denied action after the handoff.",
    "Reviewer: save approvals, removal evidence, exceptions, owners, and next-review dates."
  ];
  return {
    valid: true,
    errors: [],
    records: parsed.records,
    findings,
    plan,
    checklist,
    checklistText: checklist.map((item) => `- [ ] ${item}`).join("\n"),
    sources: AZURE_ACCESS_SOURCES,
    limitation: "This simulator analyzes only the lines supplied. It does not scan an Azure tenant, resolve inherited access, change an identity, or replace an authorized access review. Verify every action in the real tenant with the responsible owners."
  };
}
