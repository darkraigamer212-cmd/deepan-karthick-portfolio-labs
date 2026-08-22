export const BUSINESS_MM_PER_INCH = 20;
export const MIN_BILLING_INCH = 1.5;
export const BILLING_INCREMENT = 0.5;
export const FT_TO_M = 0.3048;
export const PF_MM_TO_FT = 1 / 304.8;
export const CFT_PER_CBM = 35.315;

export function toNumber(value) {
  if (typeof value === "string" && !value.trim()) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function roundBillingInch(rawInches) {
  const value = toNumber(rawInches);
  if (value <= 0) return 0;
  const roundedUp = Math.ceil((value - 1e-9) / BILLING_INCREMENT) * BILLING_INCREMENT;
  return Math.max(MIN_BILLING_INCH, roundedUp);
}

export function billingInchFromMm(mm) {
  const value = toNumber(mm);
  return value > 0 ? roundBillingInch(value / BUSINESS_MM_PER_INCH) : 0;
}

export function calculateMeasurementRow({
  tMm = 0,
  lMm = 0,
  pfValue = 0,
  pieces = 0,
  pfUnit = "ft"
} = {}) {
  const source = { tMm, lMm, pfValue, pieces };
  const thicknessMm = toNumber(tMm);
  const widthMm = toNumber(lMm);
  const rawLength = toNumber(pfValue);
  const pieceCount = toNumber(pieces);
  const pfFt = pfUnit === "mm" ? rawLength * PF_MM_TO_FT : rawLength;
  const thicknessIn = billingInchFromMm(thicknessMm);
  const widthIn = billingInchFromMm(widthMm);

  const errors = validateMeasurementInput(source);
  const valid = errors.length === 0 && thicknessIn > 0 && widthIn > 0 && pfFt > 0;

  const cft = valid ? (thicknessIn * widthIn * pfFt * pieceCount) / 144 : 0;
  const m3 = valid
    ? (thicknessMm * widthMm * (pfFt * FT_TO_M) * pieceCount) / 1_000_000
    : 0;

  return {
    thicknessIn,
    widthIn,
    pfFt,
    pieces: pieceCount,
    cft,
    icbm: cft / CFT_PER_CBM,
    m3,
    valid,
    errors
  };
}

export function validateMeasurementInput(row) {
  const errors = [];
  const values = [
    ["Thickness", row.tMm],
    ["Width", row.lMm],
    ["Length", row.pfValue]
  ];

  for (const [label, value] of values) {
    const strictNumber = typeof value === "number" ? value : Number(String(value).trim());
    const number = toNumber(value);
    if (!Number.isFinite(strictNumber)) {
      errors.push(`${label} must be a valid number.`);
      continue;
    }
    if (number <= 0) errors.push(`${label} must be greater than zero.`);
    if (number > 1_000_000) errors.push(`${label} is outside the supported demo range.`);
  }

  const strictPieces = typeof row.pieces === "number"
    ? row.pieces
    : Number(String(row.pieces).trim());
  const pieces = toNumber(row.pieces);
  if (!Number.isFinite(strictPieces) || !Number.isInteger(pieces) || pieces <= 0) {
    errors.push("Pieces must be a positive whole number.");
  } else if (pieces > 100_000) {
    errors.push("Pieces are outside the supported demo range.");
  }

  return errors;
}
