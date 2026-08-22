export const SAFE_C_INPUT_EXAMPLE = [
  "age|integer|0..120|yes",
  "temperature_c|decimal|-40..125|yes",
  "operator_note|text|80|no"
].join("\n");
export const SAFE_C_INPUT_RESET = "";

const C_RESERVED = new Set(["auto", "break", "case", "char", "const", "continue", "default", "do", "double", "else", "enum", "extern", "float", "for", "goto", "if", "inline", "int", "long", "register", "restrict", "return", "short", "signed", "sizeof", "static", "struct", "switch", "typedef", "union", "unsigned", "void", "volatile", "while", "_Alignas", "_Alignof", "_Atomic", "_Bool", "_Complex", "_Generic", "_Imaginary", "_Noreturn", "_Static_assert", "_Thread_local"]);

export function escapeCString(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n").replaceAll("\r", "\\r").replaceAll("\t", "\\t");
}

function parseNumericBounds(value, type, lineNumber, errors) {
  const text = String(value).trim();
  const separator = text.indexOf("..");
  if (separator <= 0 || separator !== text.lastIndexOf("..") || separator >= text.length - 2) {
    errors.push(`Line ${lineNumber}: ${type} bounds must use min..max.`);
    return null;
  }
  const minimum = Number(text.slice(0, separator).trim());
  const maximum = Number(text.slice(separator + 2).trim());
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) errors.push(`Line ${lineNumber}: bounds must be finite numbers.`);
  else if (minimum >= maximum) errors.push(`Line ${lineNumber}: minimum bound must be less than maximum.`);
  else if (Math.abs(minimum) > 1_000_000_000 || Math.abs(maximum) > 1_000_000_000) errors.push(`Line ${lineNumber}: bounds exceed the supported ±1000000000 range.`);
  else if (type === "integer" && (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum))) errors.push(`Line ${lineNumber}: integer bounds must be safe whole numbers.`);
  return { minimum, maximum };
}

export function parseCFieldSpecs(value) {
  const lines = String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  if (!lines.length) return { valid: false, errors: ["Enter at least one console field specification."], fields: [] };
  if (lines.length > 20) errors.push("Use 20 fields or fewer in one generated harness.");
  const fields = [];
  const names = new Set();
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 4) {
      errors.push(`Line ${lineNumber} must contain four pipe-separated fields.`);
      return;
    }
    const [name, rawType, boundsValue, rawRequired] = parts;
    const type = rawType.toLowerCase();
    const requiredValue = rawRequired.toLowerCase();
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,30}$/.test(name)) errors.push(`Line ${lineNumber}: name must be a C identifier of 1–31 characters.`);
    else if (C_RESERVED.has(name)) errors.push(`Line ${lineNumber}: name is a reserved C keyword.`);
    else if (names.has(name)) errors.push(`Line ${lineNumber}: field name must be unique.`);
    else names.add(name);
    if (!new Set(["integer", "decimal", "text"]).has(type)) errors.push(`Line ${lineNumber}: type must be integer, decimal, or text.`);
    if (!new Set(["yes", "no"]).has(requiredValue)) errors.push(`Line ${lineNumber}: required must be yes or no.`);

    let bounds = null;
    let maxLength = null;
    if (type === "integer" || type === "decimal") bounds = parseNumericBounds(boundsValue, type, lineNumber, errors);
    else if (type === "text") {
      maxLength = Number(boundsValue);
      if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 512) errors.push(`Line ${lineNumber}: text maximum length must be a whole number from 1 to 512.`);
    }
    fields.push({ id: `field-${lineNumber}`, name, type, required: requiredValue === "yes", bounds, maxLength });
  });
  return { valid: errors.length === 0, errors, fields: errors.length ? [] : fields };
}

function numberLiteral(value) {
  if (Number.isInteger(value)) return String(value);
  return Number(value).toString();
}

function buildVectors(fields) {
  return fields.flatMap((field) => {
    if (field.type === "text") return [
      { field: field.name, case: "maximum accepted length", input: `"x" repeated ${field.maxLength} times`, expected: "accept" },
      { field: field.name, case: "one character too long", input: `"x" repeated ${field.maxLength + 1} times`, expected: "reject and reprompt" },
      { field: field.name, case: "empty input", input: "empty line", expected: field.required ? "reject and reprompt" : "accept as empty" }
    ];
    const { minimum, maximum } = field.bounds;
    const epsilon = field.type === "integer" ? 1 : Math.max(0.001, Math.abs(maximum - minimum) / 1000);
    return [
      { field: field.name, case: "lower boundary", input: String(minimum), expected: "accept" },
      { field: field.name, case: "upper boundary", input: String(maximum), expected: "accept" },
      { field: field.name, case: "below lower boundary", input: String(minimum - epsilon), expected: "reject and reprompt" },
      { field: field.name, case: "above upper boundary", input: String(maximum + epsilon), expected: "reject and reprompt" },
      { field: field.name, case: "trailing junk", input: "12abc", expected: "reject and reprompt" },
      ...(field.type === "decimal" ? [{ field: field.name, case: "non-finite value", input: "nan", expected: "reject and reprompt" }] : []),
      { field: field.name, case: "empty input", input: "empty line", expected: field.required ? "reject and reprompt" : "accept default zero" }
    ];
  });
}

function generateC(fields, inputBufferSize) {
  const declarations = fields.map((field) => field.type === "integer"
    ? `    long ${field.name} = 0;`
    : field.type === "decimal"
      ? `    double ${field.name} = 0.0;`
      : `    char ${field.name}[${field.maxLength + 1}] = {0};`).join("\n");
  const reads = fields.map((field) => {
    const prompt = escapeCString(field.name.replaceAll("_", " "));
    const required = field.required ? "true" : "false";
    if (field.type === "integer") return `    if (!read_long_field("${prompt}", ${numberLiteral(field.bounds.minimum)}L, ${numberLiteral(field.bounds.maximum)}L, ${required}, &${field.name})) return EXIT_FAILURE;`;
    if (field.type === "decimal") return `    if (!read_double_field("${prompt}", ${numberLiteral(field.bounds.minimum)}, ${numberLiteral(field.bounds.maximum)}, ${required}, &${field.name})) return EXIT_FAILURE;`;
    return `    if (!read_text_field("${prompt}", ${field.name}, sizeof ${field.name}, ${required})) return EXIT_FAILURE;`;
  }).join("\n");

  return `/* Generated bounded-input skeleton. Review for the target C implementation.
 * It reads complete lines with fgets, rejects truncated input, checks conversion
 * end pointers and errno, enforces bounds, and never executes supplied text.
 */
#include <ctype.h>
#include <errno.h>
#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define INPUT_BUFFER_SIZE ${inputBufferSize}

static bool read_line(char *input_buffer, size_t capacity) {
    if (fgets(input_buffer, capacity, stdin) == NULL) return false;
    size_t length = strcspn(input_buffer, "\\n");
    if (input_buffer[length] == '\\n') { input_buffer[length] = '\\0'; return true; }
    int ch;
    while ((ch = getchar()) != '\\n' && ch != EOF) { }
    fputs("Input was too long; try again.\\n", stderr);
    return false;
}

static char *trim(char *text) {
    while (isspace((unsigned char)*text)) text++;
    char *end = text + strlen(text);
    while (end > text && isspace((unsigned char)end[-1])) *--end = '\\0';
    return text;
}

static bool read_long_field(const char *label, long minimum, long maximum, bool required, long *out) {
    char input_buffer[INPUT_BUFFER_SIZE];
    for (;;) {
        printf("%s: ", label);
        if (!read_line(input_buffer, sizeof input_buffer)) { if (feof(stdin)) return false; continue; }
        char *text = trim(input_buffer);
        if (*text == '\\0' && !required) { *out = 0; return true; }
        errno = 0; char *end = NULL; long value = strtol(text, &end, 10);
        while (end && isspace((unsigned char)*end)) end++;
        if (errno == 0 && end != text && *end == '\\0' && value >= minimum && value <= maximum) { *out = value; return true; }
        fputs("Invalid whole number or outside bounds; try again.\\n", stderr);
    }
}

static bool read_double_field(const char *label, double minimum, double maximum, bool required, double *out) {
    char input_buffer[INPUT_BUFFER_SIZE];
    for (;;) {
        printf("%s: ", label);
        if (!read_line(input_buffer, sizeof input_buffer)) { if (feof(stdin)) return false; continue; }
        char *text = trim(input_buffer);
        if (*text == '\\0' && !required) { *out = 0.0; return true; }
        errno = 0; char *end = NULL; double value = strtod(text, &end);
        while (end && isspace((unsigned char)*end)) end++;
        if (errno == 0 && end != text && *end == '\\0' && isfinite(value) && value >= minimum && value <= maximum) { *out = value; return true; }
        fputs("Invalid decimal or outside bounds; try again.\\n", stderr);
    }
}

static bool read_text_field(const char *label, char *destination, size_t capacity, bool required) {
    char input_buffer[INPUT_BUFFER_SIZE];
    for (;;) {
        printf("%s: ", label);
        if (!read_line(input_buffer, sizeof input_buffer)) { if (feof(stdin)) return false; continue; }
        char *text = trim(input_buffer); size_t length = strlen(text);
        if (length == 0 && required) { fputs("A value is required.\\n", stderr); continue; }
        if (length >= capacity) { fputs("Text exceeds the field limit.\\n", stderr); continue; }
        memcpy(destination, text, length + 1); return true;
    }
}

int main(void) {
${declarations}

${reads}

    /* Use validated fields here. */
    return EXIT_SUCCESS;
}`;
}

export function generateSafeCInputHarness(value) {
  const parsed = parseCFieldSpecs(value);
  if (!parsed.valid) return { ...parsed, code: "", testVectors: [], stackBudget: null, checklist: [] };
  const longestText = Math.max(0, ...parsed.fields.filter((field) => field.type === "text").map((field) => field.maxLength));
  const inputBufferSize = Math.max(128, longestText + 2);
  const persistentBytes = parsed.fields.reduce((total, field) => total + (field.type === "text" ? field.maxLength + 1 : 8), 0);
  const stackBudget = {
    inputBufferBytes: inputBufferSize,
    persistentFieldBytes: persistentBytes,
    estimatedTotalBytes: inputBufferSize + persistentBytes,
    note: "Estimate assumes 8-byte long/double values and excludes runtime/library stack frames. Confirm sizes on the target compiler and architecture."
  };
  return {
    valid: true,
    errors: [],
    fields: parsed.fields,
    code: generateC(parsed.fields, inputBufferSize),
    testVectors: buildVectors(parsed.fields),
    stackBudget,
    checklist: [
      "Compile with strict warnings enabled for the target compiler.",
      "Run every generated boundary, invalid, empty, and overlength vector.",
      "Confirm EOF and an overlong line cannot leave stale data in a field.",
      "Confirm numeric parsing rejects trailing characters, overflow, NaN, and infinity.",
      "Measure sizeof(long), sizeof(double), and total stack use on the target device.",
      "Review field bounds with the domain owner; generator limits are not business approval.",
      "Keep validated input separate from commands, format strings, and memory indexes."
    ],
    limitation: "This tool generates a reviewable C skeleton; it does not compile or execute code, prove portability, or replace target-specific static analysis and testing."
  };
}
