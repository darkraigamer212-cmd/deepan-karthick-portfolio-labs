import { calculateMeasurementRow, toNumber } from "./calculations.js";

export function roundMoney(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

export function calculateInvoice(rows, options = {}) {
  const sourceRows = Array.isArray(rows) ? rows : [];
  const pricingBasis = options.pricingBasis === "m3" ? "m3" : "cft";
  const rate = Math.max(0, toNumber(options.rate));
  const requestedDiscount = Math.max(0, toNumber(options.discount));
  const taxPercent = Math.min(100, Math.max(0, toNumber(options.taxPercent)));
  const paid = Math.max(0, toNumber(options.paid));
  const errors = [];

  if (!Array.isArray(rows)) errors.push("Invoice rows must be an array.");
  if (!Number.isFinite(Number(options.rate)) || rate > 100_000_000) {
    errors.push("Rate must be a valid number between 0 and 100,000,000.");
  }

  const calculatedRows = sourceRows.map((row, index) => {
    const measurement = calculateMeasurementRow(row);
    const pricedQuantity = pricingBasis === "m3" ? measurement.m3 : measurement.cft;
    const rawAmount = pricedQuantity * rate;
    const amountIsSafe = measurement.valid && Number.isFinite(rawAmount) && rawAmount <= 1_000_000_000_000;
    if (!measurement.valid) {
      errors.push(`Row ${index + 1}: ${measurement.errors.join(" ")}`);
    } else if (!amountIsSafe) {
      errors.push(`Row ${index + 1}: calculated amount is outside the supported demo range.`);
    }
    return {
      ...row,
      ...measurement,
      amount: amountIsSafe ? roundMoney(rawAmount) : 0
    };
  });

  const subtotal = roundMoney(calculatedRows.reduce((sum, row) => sum + row.amount, 0));
  const discount = roundMoney(Math.min(requestedDiscount, subtotal));
  const taxableAmount = roundMoney(Math.max(0, subtotal - discount));
  const taxAmount = roundMoney(taxableAmount * taxPercent / 100);
  const grandTotal = roundMoney(taxableAmount + taxAmount);
  const balance = roundMoney(Math.max(0, grandTotal - paid));

  return {
    rows: calculatedRows,
    pricingBasis,
    rate,
    requestedDiscount,
    discount,
    taxPercent,
    paid,
    subtotal,
    taxableAmount,
    taxAmount,
    grandTotal,
    balance,
    changeDue: roundMoney(Math.max(0, paid - grandTotal)),
    errors,
    isValid: errors.length === 0 && calculatedRows.length > 0,
    totalPieces: calculatedRows.reduce((sum, row) => sum + (row.valid ? row.pieces : 0), 0),
    totalCft: calculatedRows.reduce((sum, row) => sum + row.cft, 0),
    totalM3: calculatedRows.reduce((sum, row) => sum + row.m3, 0)
  };
}
