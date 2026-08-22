import assert from "node:assert/strict";
import test from "node:test";
import {
  billingInchFromMm,
  calculateMeasurementRow,
  roundBillingInch,
  validateMeasurementInput
} from "../timber-src/domain/calculations.js";
import { calculateInvoice } from "../timber-src/domain/invoice.js";

test("preserves the verified business-inch rounding rule", () => {
  const cases = [
    [0, 0], [1, 1.5], [20, 1.5], [22, 1.5], [28, 1.5], [30, 1.5],
    [31, 2], [40, 2], [41, 2.5], [50, 2.5], [51, 3], [61, 3.5], [100, 5]
  ];
  assert.equal(roundBillingInch(0), 0);
  for (const [millimetres, expected] of cases) {
    assert.equal(billingInchFromMm(millimetres), expected, `${millimetres} mm conversion`);
  }
});

test("matches the preserved raw-millimetre M3 workbook vector", () => {
  const result = calculateMeasurementRow({
    tMm: 95,
    lMm: 145,
    pfValue: 7,
    pieces: 49,
    pfUnit: "ft"
  });
  assert.ok(Math.abs(result.m3 - 1.44012666) < 1e-8);
});

test("calculates CFT, ICBM, and raw-millimetre M3", () => {
  const result = calculateMeasurementRow({
    tMm: 40,
    lMm: 60,
    pfValue: 10,
    pieces: 2,
    pfUnit: "ft"
  });

  assert.equal(result.valid, true);
  assert.equal(result.thicknessIn, 2);
  assert.equal(result.widthIn, 3);
  assert.ok(Math.abs(result.cft - 0.8333333333333334) < 1e-12);
  assert.ok(Math.abs(result.m3 - 0.0146304) < 1e-12);
});

test("supports PF length supplied in millimetres", () => {
  const result = calculateMeasurementRow({
    tMm: 40,
    lMm: 60,
    pfValue: 3048,
    pieces: 2,
    pfUnit: "mm"
  });
  assert.ok(Math.abs(result.pfFt - 10) < 1e-12);
  assert.ok(Math.abs(result.cft - 0.8333333333333334) < 1e-12);
});

test("rejects incomplete and unsafe measurement input", () => {
  assert.deepEqual(validateMeasurementInput({ tMm: 0, lMm: 50, pfValue: 10, pieces: 1 }), [
    "Thickness must be greater than zero."
  ]);
  assert.deepEqual(validateMeasurementInput({ tMm: 50, lMm: 50, pfValue: 10, pieces: 1.5 }), [
    "Pieces must be a positive whole number."
  ]);
  assert.deepEqual(validateMeasurementInput({ tMm: "12abc", lMm: 50, pfValue: 10, pieces: 1 }), [
    "Thickness must be a valid number."
  ]);
  assert.deepEqual(validateMeasurementInput({ tMm: 1_000_001, lMm: 50, pfValue: 10, pieces: 1 }), [
    "Thickness is outside the supported demo range."
  ]);
});

test("calculates a financial invoice without changing measurement totals", () => {
  const invoice = calculateInvoice([
    { tMm: 40, lMm: 60, pfValue: 10, pieces: 2, pfUnit: "ft" }
  ], {
    pricingBasis: "cft",
    rate: 1000,
    discount: 100,
    taxPercent: 18,
    paid: 200
  });

  assert.equal(invoice.subtotal, 833.33);
  assert.equal(invoice.taxableAmount, 733.33);
  assert.equal(invoice.taxAmount, 132);
  assert.equal(invoice.grandTotal, 865.33);
  assert.equal(invoice.balance, 665.33);
  assert.equal(invoice.isValid, true);
  assert.ok(Math.abs(invoice.totalCft - 0.8333333333333334) < 1e-12);
});

test("does not bill invalid or unsafe rows", () => {
  const invoice = calculateInvoice([
    { tMm: 1_000_001, lMm: 60, pfValue: 10, pieces: 2, pfUnit: "ft" }
  ], { pricingBasis: "cft", rate: 1000 });
  assert.equal(invoice.isValid, false);
  assert.equal(invoice.subtotal, 0);
  assert.match(invoice.errors[0], /outside the supported demo range/);
});

test("clamps the applied discount to the subtotal", () => {
  const invoice = calculateInvoice([
    { tMm: 40, lMm: 60, pfValue: 10, pieces: 2, pfUnit: "ft" }
  ], { pricingBasis: "cft", rate: 1000, discount: 5000, taxPercent: 18 });
  assert.equal(invoice.requestedDiscount, 5000);
  assert.equal(invoice.discount, 833.33);
  assert.equal(invoice.grandTotal, 0);
});

test("supports M3 pricing and overpayment change", () => {
  const invoice = calculateInvoice([
    { tMm: 40, lMm: 60, pfValue: 10, pieces: 2, pfUnit: "ft" }
  ], {
    pricingBasis: "m3",
    rate: 50_000,
    paid: 1000
  });

  assert.equal(invoice.subtotal, 731.52);
  assert.equal(invoice.balance, 0);
  assert.equal(invoice.changeDue, 268.48);
});
