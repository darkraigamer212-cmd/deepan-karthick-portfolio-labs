import assert from "node:assert/strict";
import test from "node:test";
import {
  escapeCString,
  generateSafeCInputHarness,
  parseCFieldSpecs,
  SAFE_C_INPUT_EXAMPLE
} from "../labs-src/labs/safeCInputHarness.js";

test("safe C harness parses example fields and generates bounded conversion code", () => {
  const result = generateSafeCInputHarness(SAFE_C_INPUT_EXAMPLE);
  assert.equal(result.valid, true);
  assert.equal(result.fields.length, 3);
  assert.match(result.code, /fgets\(input_buffer, capacity, stdin\)/);
  assert.match(result.code, /char input_buffer\[INPUT_BUFFER_SIZE\]/);
  assert.match(result.code, /strtol\(text, &end, 10\)/);
  assert.match(result.code, /strtod\(text, &end\)/);
  assert.match(result.code, /isfinite\(value\)/);
  assert.match(result.code, /char operator_note\[81\]/);
});

test("safe C harness emits boundary, invalid, optional, and overlength vectors", () => {
  const result = generateSafeCInputHarness(SAFE_C_INPUT_EXAMPLE);
  assert.ok(result.testVectors.some((item) => item.field === "age" && item.case === "lower boundary" && item.expected === "accept"));
  assert.ok(result.testVectors.some((item) => item.field === "temperature_c" && item.case === "non-finite value"));
  assert.ok(result.testVectors.some((item) => item.field === "operator_note" && item.case === "one character too long"));
  assert.ok(result.testVectors.some((item) => item.field === "operator_note" && item.input === "empty line" && item.expected === "accept as empty"));
});

test("safe C harness reports a transparent conservative buffer budget", () => {
  const result = generateSafeCInputHarness("note|text|200|yes\ncount|integer|1..9|yes");
  assert.deepEqual(result.stackBudget, {
    inputBufferBytes: 202,
    persistentFieldBytes: 209,
    estimatedTotalBytes: 411,
    note: "Estimate assumes 8-byte long/double values and excludes runtime/library stack frames. Confirm sizes on the target compiler and architecture."
  });
});

test("safe C field parser rejects unsafe identifiers and invalid bounds", () => {
  const result = parseCFieldSpecs(["while|integer|0..10|yes", "bad-name|text|0|maybe", "score|decimal|10..1|yes"].join("\n"));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("reserved C keyword")));
  assert.ok(result.errors.some((error) => error.includes("C identifier")));
  assert.ok(result.errors.some((error) => error.includes("whole number from 1 to 512")));
  assert.ok(result.errors.some((error) => error.includes("required must be yes or no")));
  assert.ok(result.errors.some((error) => error.includes("minimum bound must be less")));
});

test("safe C field parser supports fractional decimal boundaries", () => {
  const result = generateSafeCInputHarness("voltage|decimal|-3.3..5.25|yes");
  assert.equal(result.valid, true);
  assert.deepEqual(result.fields[0].bounds, { minimum: -3.3, maximum: 5.25 });
  assert.match(result.code, /read_double_field\("voltage", -3\.3, 5\.25/);
});

test("C string escaping handles generated literal metacharacters", () => {
  assert.equal(escapeCString('a"b\\c\n'), 'a\\"b\\\\c\\n');
});
