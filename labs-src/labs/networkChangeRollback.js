const MAX_ROWS = 20;

export const NETWORK_CHANGE_EXAMPLE = {
  changeGoal: "Split office users and new VoIP phones into separate networks while preserving rollback.",
  downtimeWindow: "Saturday 22:00–23:00 IST",
  beforeInventory: "Office,10.20.10.0/24,120\nServers,10.20.20.0/26,35",
  proposedInventory: "Office,10.20.10.0/25,90\nVoIP,10.20.10.128/26,35\nServers,10.20.20.0/26,35"
};

export function ipv4ToNumber(address) {
  const parts = String(address).split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) {
    throw new TypeError(`Invalid IPv4 address “${address}”.`);
  }
  return parts.reduce((value, part) => value * 256 + Number(part), 0);
}

export function numberToIpv4(value) {
  if (!Number.isInteger(value) || value < 0 || value > 4294967295) throw new RangeError("IPv4 number is out of range.");
  return [24, 16, 8, 0].map((shift) => Math.floor(value / (2 ** shift)) % 256).join(".");
}

function reservedReason(addressNumber) {
  const first = Math.floor(addressNumber / 16777216);
  const second = Math.floor(addressNumber / 65536) % 256;
  if (first === 0) return "the 0.0.0.0/8 current-network range";
  if (first === 127) return "the 127.0.0.0/8 loopback range";
  if (first === 169 && second === 254) return "the 169.254.0.0/16 link-local range";
  if (first >= 224) return "multicast or future-reserved address space";
  return "";
}

export function parseCidr(cidr) {
  const match = String(cidr).trim().match(/^([^/]+)\/(\d{1,2})$/);
  if (!match) throw new TypeError(`Invalid CIDR “${cidr}”. Use address/prefix, for example 10.0.0.0/24.`);
  const addressNumber = ipv4ToNumber(match[1]);
  const prefix = Number(match[2]);
  if (prefix < 1 || prefix > 30) throw new RangeError(`CIDR “${cidr}” must use /1 through /30 for a host network.`);
  const reserved = reservedReason(addressNumber);
  if (reserved) throw new RangeError(`CIDR “${cidr}” is inside ${reserved}.`);
  const size = 2 ** (32 - prefix);
  const networkNumber = Math.floor(addressNumber / size) * size;
  const broadcastNumber = networkNumber + size - 1;
  return {
    supplied: String(cidr).trim(),
    cidr: `${numberToIpv4(networkNumber)}/${prefix}`,
    prefix,
    network: numberToIpv4(networkNumber),
    broadcast: numberToIpv4(broadcastNumber),
    firstUsable: numberToIpv4(networkNumber + 1),
    lastUsable: numberToIpv4(broadcastNumber - 1),
    usableHosts: size - 2,
    networkNumber,
    broadcastNumber,
    wasNormalized: addressNumber !== networkNumber
  };
}

export function parseInventory(text, label) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], errors: [`${label} inventory is empty.`] };
  if (lines.length > MAX_ROWS) return { rows: [], errors: [`${label} inventory has ${lines.length} rows; the safe limit is ${MAX_ROWS}.`] };
  const rows = [];
  const errors = [];
  const names = new Set();

  lines.forEach((line, index) => {
    const parts = line.split(",").map((part) => part.trim());
    if (parts.length !== 3 || !parts[0]) {
      errors.push(`${label} row ${index + 1}: use name,CIDR,requiredHosts.`);
      return;
    }
    const key = parts[0].toLowerCase();
    if (names.has(key)) errors.push(`${label} row ${index + 1}: duplicate network name “${parts[0]}”.`);
    names.add(key);
    const requiredHosts = Number(parts[2]);
    if (!Number.isInteger(requiredHosts) || requiredHosts < 1 || requiredHosts > 1000000) {
      errors.push(`${label} row ${index + 1}: requiredHosts must be a whole number from 1 to 1,000,000.`);
      return;
    }
    try {
      rows.push({ name: parts[0], key, requiredHosts, ...parseCidr(parts[1]) });
    } catch (error) {
      errors.push(`${label} row ${index + 1}: ${error.message}`);
    }
  });
  return { rows, errors };
}

export function cidrsOverlap(left, right) {
  return left.networkNumber <= right.broadcastNumber && right.networkNumber <= left.broadcastNumber;
}

function inventoryMap(rows) {
  return new Map(rows.map((row) => [row.key, row]));
}

export function analyzeNetworkChange(input = {}) {
  const errors = {};
  if (String(input.changeGoal ?? "").trim().length < 16) errors.changeGoal = "Describe the intended network change in at least 16 characters.";
  if (String(input.downtimeWindow ?? "").trim().length < 5) errors.downtimeWindow = "Provide an agreed downtime window or state that none is permitted.";
  const before = parseInventory(input.beforeInventory, "Before");
  const proposed = parseInventory(input.proposedInventory, "Proposed");
  if (before.errors.length) errors.beforeInventory = before.errors;
  if (proposed.errors.length) errors.proposedInventory = proposed.errors;
  if (Object.keys(errors).length) return { errors, findings: [], changes: [], runbook: null, stakeholderSummary: "" };

  const findings = [];
  for (let index = 0; index < proposed.rows.length; index += 1) {
    for (let other = index + 1; other < proposed.rows.length; other += 1) {
      if (cidrsOverlap(proposed.rows[index], proposed.rows[other])) {
        findings.push({ severity: "Blocker", type: "internal-overlap", message: `${proposed.rows[index].name} ${proposed.rows[index].cidr} overlaps ${proposed.rows[other].name} ${proposed.rows[other].cidr}.` });
      }
    }
  }

  for (const row of proposed.rows) {
    if (row.requiredHosts > row.usableHosts) {
      findings.push({ severity: "Blocker", type: "capacity", message: `${row.name} needs ${row.requiredHosts} hosts but ${row.cidr} provides ${row.usableHosts}.` });
    } else if (Math.ceil(row.requiredHosts * 1.2) > row.usableHosts) {
      findings.push({ severity: "Warning", type: "growth", message: `${row.name} fits now but lacks 20% growth headroom (${row.requiredHosts} required, ${row.usableHosts} usable).` });
    }
    if (row.wasNormalized) findings.push({ severity: "Warning", type: "boundary", message: `${row.name} was normalized from ${row.supplied} to network boundary ${row.cidr}; broadcast is ${row.broadcast}.` });
  }

  const beforeByName = inventoryMap(before.rows);
  const proposedByName = inventoryMap(proposed.rows);
  for (const proposedRow of proposed.rows) {
    for (const beforeRow of before.rows) {
      if (proposedRow.key !== beforeRow.key && cidrsOverlap(proposedRow, beforeRow) && !proposedByName.has(beforeRow.key)) {
        findings.push({ severity: "Blocker", type: "before-proposed-overlap", message: `New ${proposedRow.name} ${proposedRow.cidr} reuses space from removed ${beforeRow.name} ${beforeRow.cidr}; prove the old network is drained before activation.` });
      }
    }
  }

  const changes = [];
  for (const row of before.rows) {
    const next = proposedByName.get(row.key);
    if (!next) changes.push({ type: "remove", name: row.name, before: row, proposed: null });
    else if (next.cidr !== row.cidr || next.requiredHosts !== row.requiredHosts) changes.push({ type: "modify", name: row.name, before: row, proposed: next });
  }
  for (const row of proposed.rows) {
    if (!beforeByName.has(row.key)) changes.push({ type: "add", name: row.name, before: null, proposed: row });
  }

  const blocked = findings.some((finding) => finding.severity === "Blocker");
  const runbook = buildRunbook(input, before.rows, proposed.rows, changes, findings, blocked);
  return {
    errors: {},
    findings,
    changes,
    blocked,
    before: before.rows,
    proposed: proposed.rows,
    runbook,
    stakeholderSummary: formatStakeholderSummary(input, changes, findings, blocked)
  };
}

function buildRunbook(input, before, proposed, changes, findings, blocked) {
  const blockers = findings.filter((finding) => finding.severity === "Blocker");
  return {
    precheck: [
      `${blocked ? "DO NOT START: resolve" : "Confirm there are"} ${blockers.length} blocking finding(s).`,
      "Export device configurations, DHCP reservations, routes, ACLs, DNS records, and monitoring baselines.",
      `Confirm change owner, console access, communication channel, and downtime window: ${input.downtimeWindow.trim()}.`,
      ...proposed.map((row) => `Confirm ${row.name}: ${row.cidr}, usable ${row.firstUsable}–${row.lastUsable}, broadcast ${row.broadcast}, capacity ${row.usableHosts}.`)
    ],
    change: blocked
      ? ["Change execution is intentionally withheld until every blocker is resolved and the analysis is rerun."]
      : changes.map((change) => change.type === "add"
        ? `Stage ${change.name} on ${change.proposed.cidr}; keep it isolated until DHCP, gateway, ACL, and routing checks pass.`
        : change.type === "remove"
          ? `Drain ${change.name} ${change.before.cidr}; verify zero active clients before removing routes or DHCP scope.`
          : `Move ${change.name} from ${change.before.cidr} to ${change.proposed.cidr}; preserve the old scope disabled but recoverable until verification completes.`),
    verification: [
      "Verify gateway, DHCP lease, DNS resolution, required internal routes, internet path, and monitoring from one test client per proposed network.",
      "Confirm no client received a network or broadcast address and sampled clients fall inside the documented usable range.",
      "Compare application health, latency, packet loss, authentication, and logs with the saved baseline.",
      "Ask the change owner to sign off before deleting any previous configuration."
    ],
    rollback: [
      "Announce rollback and freeze further configuration changes.",
      ...changes.slice().reverse().map((change) => change.type === "add"
        ? `Disable new ${change.name} ${change.proposed.cidr} routes and DHCP scope; remove them only after clients are drained.`
        : change.type === "remove"
          ? `Restore ${change.name} ${change.before.cidr}, routes, ACLs, and DHCP scope from the saved configuration.`
          : `Restore ${change.name} to ${change.before.cidr} and its saved DHCP, route, ACL, and DNS settings.`),
      "Renew a test-client lease, repeat gateway/DNS/application checks, reconcile logs, and record the rollback decision."
    ]
  };
}

export function formatStakeholderSummary(input, changes, findings, blocked) {
  const lines = [
    "NETWORK CHANGE STAKEHOLDER SUMMARY",
    `Goal: ${input.changeGoal.trim()}`,
    `Window: ${input.downtimeWindow.trim()}`,
    `Status: ${blocked ? "BLOCKED — do not start" : "READY FOR CONTROLLED CHANGE"}`,
    `Scope: ${changes.length} changed network(s); ${findings.length} finding(s).`,
    "",
    "Planned changes:"
  ];
  if (!changes.length) lines.push("- No inventory difference detected.");
  changes.forEach((change) => lines.push(`- ${change.type.toUpperCase()} ${change.name}: ${change.before?.cidr ?? "none"} -> ${change.proposed?.cidr ?? "none"}`));
  lines.push("Findings:");
  if (!findings.length) lines.push("- No deterministic overlap, capacity, growth, or boundary finding.");
  findings.forEach((finding) => lines.push(`- ${finding.severity}: ${finding.message}`));
  lines.push("Rollback commitment: Saved network configuration remains recoverable until verification and owner sign-off complete.");
  return lines.join("\n");
}

export { MAX_ROWS };
