export const QUEUE_REPLAY_EXAMPLE = [
  "WALK-IN-01|0|2|8",
  "URGENT-02|2|5|12",
  "CALL-03|3|3|5",
  "FOLLOWUP-04|5|1|4",
  "URGENT-05|9|4|7"
].join("\n");

export const QUEUE_REPLAY_RESET = "";
export const DEFAULT_AGING_MINUTES = 10;
export const STARVATION_WAIT_MINUTES = 30;

export function parseQueueCases(value) {
  const lines = String(value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  if (!lines.length) return { valid: false, errors: ["Enter at least one queue case."], cases: [] };
  if (lines.length > 30) errors.push("Use 30 queue cases or fewer in one replay.");
  const cases = [];
  const ids = new Set();

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length !== 4) {
      errors.push(`Line ${lineNumber} must contain four pipe-separated fields.`);
      return;
    }
    const [id, arrivalRaw, urgencyRaw, serviceRaw] = parts;
    const arrivalMinute = Number(arrivalRaw);
    const urgency = Number(urgencyRaw);
    const serviceMinutes = Number(serviceRaw);
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,23}$/.test(id)) errors.push(`Line ${lineNumber}: id must use 1–24 letters, numbers, underscores, or hyphens.`);
    else if (ids.has(id)) errors.push(`Line ${lineNumber}: case id must be unique.`);
    else ids.add(id);
    if (!Number.isInteger(arrivalMinute) || arrivalMinute < 0 || arrivalMinute > 1440) errors.push(`Line ${lineNumber}: arrival minute must be a whole number from 0 to 1440.`);
    if (!Number.isInteger(urgency) || urgency < 1 || urgency > 5) errors.push(`Line ${lineNumber}: urgency must be a whole number from 1 to 5.`);
    if (!Number.isInteger(serviceMinutes) || serviceMinutes < 1 || serviceMinutes > 240) errors.push(`Line ${lineNumber}: service minutes must be a whole number from 1 to 240.`);
    cases.push({ id, arrivalMinute, urgency, serviceMinutes, inputOrder: index });
  });
  return { valid: errors.length === 0, errors, cases: errors.length ? [] : cases };
}

export function validateAgingMinutes(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 120
    ? []
    : ["Aging interval must be a whole number from 1 to 120 minutes."];
}

function summarizeSchedule(rows) {
  const waits = rows.map((row) => row.waitMinutes);
  const promptness = waits.map((wait) => 1 / (1 + wait));
  const promptnessSum = promptness.reduce((sum, value) => sum + value, 0);
  const fairness = promptness.length
    ? Math.round((promptnessSum ** 2 / (promptness.length * promptness.reduce((sum, value) => sum + value ** 2, 0))) * 100)
    : 100;
  return {
    averageWait: Math.round((waits.reduce((sum, value) => sum + value, 0) / waits.length) * 100) / 100,
    maxWait: Math.max(...waits),
    fairness,
    starvationCount: rows.filter((row) => row.starved).length
  };
}
function runSchedule(cases, selectNext, agingMinutes) {
  const pending = cases.map((item) => ({ ...item }));
  const rows = [];
  let minute = Math.min(...pending.map((item) => item.arrivalMinute));
  while (pending.length) {
    const available = pending.filter((item) => item.arrivalMinute <= minute);
    if (!available.length) {
      minute = Math.min(...pending.map((item) => item.arrivalMinute));
      continue;
    }
    const selected = selectNext(available, minute, agingMinutes);
    const waitMinutes = minute - selected.arrivalMinute;
    const finishMinute = minute + selected.serviceMinutes;
    rows.push({
      ...selected,
      dequeuePosition: rows.length + 1,
      startMinute: minute,
      finishMinute,
      waitMinutes,
      effectiveUrgency: selected.urgency + Math.floor(waitMinutes / agingMinutes),
      starved: waitMinutes >= STARVATION_WAIT_MINUTES
    });
    pending.splice(pending.findIndex((item) => item.inputOrder === selected.inputOrder), 1);
    minute = finishMinute;
  }
  return { rows, metrics: summarizeSchedule(rows) };
}

function selectFifo(available) {
  return [...available].sort((left, right) => left.arrivalMinute - right.arrivalMinute || left.inputOrder - right.inputOrder)[0];
}

function selectPriorityWithAging(available, minute, agingMinutes) {
  return [...available].sort((left, right) => {
    const leftScore = left.urgency + Math.floor((minute - left.arrivalMinute) / agingMinutes);
    const rightScore = right.urgency + Math.floor((minute - right.arrivalMinute) / agingMinutes);
    return rightScore - leftScore || left.arrivalMinute - right.arrivalMinute || left.inputOrder - right.inputOrder;
  })[0];
}

function generateCContract(cases, agingMinutes) {
  const rows = cases.map((item) => `    {"${item.id}", ${item.arrivalMinute}, ${item.urgency}, ${item.serviceMinutes}}`).join(",\n");
  return `/* Deterministic implementation contract
 * Bounds: <= 30 cases; id <= 24 chars; arrival 0..1440;
 * urgency 1..5; service minutes 1..240.
 * FIFO comparator: arrival_minute ASC, then input order ASC.
 * Priority-aging score at each dequeue:
 * urgency + floor((now - arrival_minute) / ${agingMinutes}).
 * Higher score wins; ties use arrival, then input order.
 * Scheduling is single-server, non-preemptive. Starvation flag: wait >= ${STARVATION_WAIT_MINUTES}.
 */
#include <stddef.h>

#define CASE_ID_CAP 25
#define AGING_MINUTES ${agingMinutes}
#define STARVATION_MINUTES ${STARVATION_WAIT_MINUTES}

typedef struct {
    char id[CASE_ID_CAP];
    unsigned short arrival_minute;
    unsigned char urgency;
    unsigned short service_minutes;
} QueueCase;

static const QueueCase TEST_VECTOR[] = {
${rows}
};

static const size_t TEST_VECTOR_COUNT =
    sizeof(TEST_VECTOR) / sizeof(TEST_VECTOR[0]);`;
}

export function replayQueueFairness(value, agingMinutes = DEFAULT_AGING_MINUTES) {
  const parsed = parseQueueCases(value);
  const agingErrors = validateAgingMinutes(agingMinutes);
  const errors = [...parsed.errors, ...agingErrors];
  if (errors.length) return { valid: false, errors, fifo: null, priorityAging: null, cContract: "" };
  const interval = Number(agingMinutes);
  const fifo = runSchedule(parsed.cases, selectFifo, interval);
  const priorityAging = runSchedule(parsed.cases, selectPriorityWithAging, interval);
  return {
    valid: true,
    errors: [],
    fifo,
    priorityAging,
    cases: parsed.cases,
    cContract: generateCContract(parsed.cases, interval),
    fairnessNote: "Fairness uses Jain's index over 1/(1 + wait minutes), reported from 0–100. A higher number means waiting burden is distributed more evenly; it does not decide which policy is ethically correct.",
    limitation: "This local, single-server replay omits preemption, staff skills, clinical rules, SLAs, and real queue state. A responsible service owner must approve any operating policy."
  };
}
