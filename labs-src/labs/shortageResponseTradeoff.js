const MAX_SEGMENTS = 12;

export const SHORTAGE_EXAMPLE = {
  essentialItem: "One-week household water packs",
  demandRows: "Families with children|40|2|130\nOlder residents|25|2|115\nOther households|55|1|95",
  availableUnits: 100,
  baselinePrice: 80,
  unitCost: 60,
  candidatePrice: 110,
  purchaseCap: 1
};

export function parseDemandSegments(text) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  const segments = [];
  const names = new Set();
  if (!lines.length) errors.push("Add at least one demand segment.");
  if (lines.length > MAX_SEGMENTS) errors.push(`Use at most ${MAX_SEGMENTS} segments.`);
  lines.slice(0, MAX_SEGMENTS).forEach((line, index) => {
    const [name, buyersText, maxUnitsText, willingnessText, ...extra] = line.split("|").map((part) => part.trim());
    if (!name || !buyersText || !maxUnitsText || !willingnessText || extra.length) {
      errors.push(`Row ${index + 1}: use segment|buyers|max units per buyer|willingness to pay.`);
      return;
    }
    const key = name.toLowerCase();
    if (names.has(key)) errors.push(`Row ${index + 1}: duplicate segment “${name}”.`);
    names.add(key);
    const buyers = Number(buyersText);
    const maxUnitsPerBuyer = Number(maxUnitsText);
    const willingnessToPay = Number(willingnessText);
    if (!Number.isInteger(buyers) || buyers < 1 || buyers > 10000) errors.push(`Row ${index + 1}: buyers must be 1–10,000.`);
    if (!Number.isInteger(maxUnitsPerBuyer) || maxUnitsPerBuyer < 1 || maxUnitsPerBuyer > 100) errors.push(`Row ${index + 1}: max units per buyer must be 1–100.`);
    if (!Number.isFinite(willingnessToPay) || willingnessToPay < 0 || willingnessToPay > 1000000) errors.push(`Row ${index + 1}: willingness to pay must be 0–1,000,000.`);
    if (Number.isInteger(buyers) && buyers >= 1 && buyers <= 10000 && Number.isInteger(maxUnitsPerBuyer) && maxUnitsPerBuyer >= 1 && maxUnitsPerBuyer <= 100 && Number.isFinite(willingnessToPay) && willingnessToPay >= 0 && willingnessToPay <= 1000000) {
      segments.push({ name, key, buyers, maxUnitsPerBuyer, willingnessToPay, demand: buyers * maxUnitsPerBuyer, order: index });
    }
  });
  return { segments, errors };
}

export function validateShortageInput(input = {}) {
  const errors = {};
  if (String(input.essentialItem ?? "").trim().length < 5) errors.essentialItem = "Name the essential item being allocated.";
  const parsed = parseDemandSegments(input.demandRows);
  if (parsed.errors.length) errors.demandRows = parsed.errors;
  const bounded = [
    ["availableUnits", 1, 1000000, true],
    ["baselinePrice", 0, 1000000, false],
    ["unitCost", 0, 1000000, false],
    ["candidatePrice", 0, 1000000, false],
    ["purchaseCap", 1, 100, true]
  ];
  bounded.forEach(([field, min, max, integer]) => {
    const value = Number(input[field]);
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) errors[field] = `Enter ${integer ? "a whole number" : "a number"} from ${min} to ${max}.`;
  });
  if (!errors.unitCost && !errors.baselinePrice && Number(input.unitCost) > Number(input.baselinePrice)) errors.unitCost = "Unit cost exceeds baseline price; confirm the baseline before comparison.";
  return { errors, segments: parsed.segments };
}

function allocateByRank(segments, availableUnits, price) {
  let remaining = availableUnits;
  const allocations = segments
    .map((segment) => ({ ...segment, eligible: segment.willingnessToPay >= price, allocatedUnits: 0 }))
    .sort((left, right) => right.willingnessToPay - left.willingnessToPay || left.order - right.order);
  allocations.forEach((segment) => {
    if (!segment.eligible) return;
    segment.allocatedUnits = Math.min(segment.demand, remaining);
    remaining -= segment.allocatedUnits;
  });
  return allocations.sort((left, right) => left.order - right.order);
}

function allocateWithCap(segments, availableUnits, price, cap) {
  const eligible = segments.map((segment) => ({ ...segment, eligible: segment.willingnessToPay >= price, cappedDemand: segment.buyers * Math.min(segment.maxUnitsPerBuyer, cap), allocatedUnits: 0 }));
  const totalDemand = eligible.reduce((sum, segment) => sum + (segment.eligible ? segment.cappedDemand : 0), 0);
  const distributable = Math.min(availableUnits, totalDemand);
  let used = 0;
  eligible.forEach((segment) => {
    if (!segment.eligible || totalDemand === 0) return;
    segment.allocatedUnits = Math.floor(distributable * segment.cappedDemand / totalDemand);
    used += segment.allocatedUnits;
  });
  let remainder = distributable - used;
  for (const segment of eligible) {
    if (!segment.eligible || remainder <= 0) continue;
    const room = segment.cappedDemand - segment.allocatedUnits;
    const addition = Math.min(room, remainder);
    segment.allocatedUnits += addition;
    remainder -= addition;
  }
  return eligible;
}

function summarizePolicy(name, allocations, price, unitCost, baselineDemand, baselineEligibleBuyers) {
  const units = allocations.reduce((sum, segment) => sum + segment.allocatedUnits, 0);
  const servedBuyers = allocations.reduce((sum, segment) => sum + Math.min(segment.buyers, segment.allocatedUnits), 0);
  const servedRates = allocations.filter((segment) => segment.buyers > 0).map((segment) => Math.min(segment.buyers, segment.allocatedUnits) / segment.buyers);
  return {
    name,
    price,
    allocations,
    units,
    revenue: units * price,
    grossMarginProxy: units * (price - unitCost),
    servedBuyers,
    unmetUnits: Math.max(0, baselineDemand - units),
    averageSpendPerServedBuyer: servedBuyers ? units * price / servedBuyers : 0,
    accessCoverage: baselineEligibleBuyers ? servedBuyers / baselineEligibleBuyers : 0,
    segmentAccessGap: servedRates.length ? Math.max(...servedRates) - Math.min(...servedRates) : 0
  };
}

export function compareShortageResponses(input) {
  const validated = validateShortageInput(input);
  if (Object.keys(validated.errors).length) return { errors: validated.errors, candidate: null, capped: null, memo: "", assumptions: [] };
  const segments = validated.segments;
  const baselinePrice = Number(input.baselinePrice);
  const available = Number(input.availableUnits);
  const unitCost = Number(input.unitCost);
  const baselineEligible = segments.filter((segment) => segment.willingnessToPay >= baselinePrice);
  const baselineDemand = baselineEligible.reduce((sum, segment) => sum + segment.demand, 0);
  const baselineEligibleBuyers = baselineEligible.reduce((sum, segment) => sum + segment.buyers, 0);
  const candidateAllocations = allocateByRank(segments, available, Number(input.candidatePrice));
  const cappedAllocations = allocateWithCap(segments, available, baselinePrice, Number(input.purchaseCap));
  const candidate = summarizePolicy("Candidate-price allocation", candidateAllocations, Number(input.candidatePrice), unitCost, baselineDemand, baselineEligibleBuyers);
  const capped = summarizePolicy("Baseline-price purchase cap", cappedAllocations, baselinePrice, unitCost, baselineDemand, baselineEligibleBuyers);
  const assumptions = [
    "Each segment is represented by a buyer count, desired maximum quantity, and stated willingness-to-pay threshold.",
    "The candidate-price policy serves eligible higher-willingness segments first; the cap policy distributes available units proportionally to capped segment demand.",
    "A buyer receiving at least one unit counts as served; partial household need is not measured.",
    "Revenue excludes taxes, fixed costs, spoilage, substitution, enforcement cost, and future supply response.",
    "Access coverage and segment access gap are distribution proxies, not welfare or vulnerability measurements."
  ];
  return { errors: {}, candidate, capped, assumptions, memo: formatOwnerMemo(input, candidate, capped, assumptions) };
}

export function formatOwnerMemo(input, candidate, capped, assumptions) {
  const percent = (value) => `${(value * 100).toFixed(1)}%`;
  return [
    "SHORTAGE RESPONSE OWNER MEMO",
    `Item: ${input.essentialItem.trim()}`,
    `Inventory available: ${input.availableUnits} units`,
    "",
    `Candidate price (${input.candidatePrice} per unit): revenue ${candidate.revenue.toFixed(2)}, served buyers ${candidate.servedBuyers}, unmet baseline demand ${candidate.unmetUnits}, access coverage ${percent(candidate.accessCoverage)}, segment access gap ${percent(candidate.segmentAccessGap)}.`,
    `Purchase cap (${input.purchaseCap} per buyer at ${input.baselinePrice}): revenue ${capped.revenue.toFixed(2)}, served buyers ${capped.servedBuyers}, unmet baseline demand ${capped.unmetUnits}, access coverage ${percent(capped.accessCoverage)}, segment access gap ${percent(capped.segmentAccessGap)}.`,
    "",
    "Decision record: choose only after checking essential-needs impact, restocking options, staff safety, enforcement practicality, and local rules.",
    "Legal/ethics limitation: this deterministic comparison is not pricing advice. Anti-price-gouging, consumer-protection, rationing, and essential-goods rules require local legal review.",
    "Assumptions:",
    ...assumptions.map((assumption) => `- ${assumption}`),
    "Owner decision and reason: ________________________________________________"
  ].join("\n");
}

export { MAX_SEGMENTS };
