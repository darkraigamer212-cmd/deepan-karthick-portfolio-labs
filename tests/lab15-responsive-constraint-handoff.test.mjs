import test from "node:test";
import assert from "node:assert/strict";
import {
  RESPONSIVE_HANDOFF_EXAMPLE,
  buildResponsiveHandoff,
  parseComponentInventory,
  parseViewportWidths
} from "../labs-src/labs/responsiveConstraintHandoff.js";

test("handoff generates per-viewport reflow and invariant focus order", () => {
  const result = buildResponsiveHandoff(RESPONSIVE_HANDOFF_EXAMPLE);

  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.layouts.map((layout) => layout.viewport), [360, 768, 1024, 1440]);
  assert.deepEqual(result.focusOrder.map((item) => item.name), ["Primary navigation", "Search filters", "Confirm booking"]);
  assert.ok(result.layouts.every((layout) => layout.decisions.find((item) => item.name === "Confirm booking").decision.startsWith("Never hide")));
  assert.match(result.cssStarter, /grid-template-columns/);
  assert.equal(result.checklist.length, 7);
});

test("components wider than content area produce collision warnings", () => {
  const result = buildResponsiveHandoff({
    screenTask: "Let an operator search records and approve one selected record.",
    viewportWidths: "320",
    componentInventory: "Record table|high|600|content\nApprove|critical|120|action"
  });

  assert.equal(result.layouts[0].feasible, false);
  assert.match(result.layouts[0].collisionWarnings[0], /Record table requires 600px/);
});

test("inventory and viewport parsers enforce formats and bounds", () => {
  assert.ok(parseViewportWidths("200, 4000").errors.length === 2);
  assert.match(parseComponentInventory("Hero|urgent|40|magic").errors.join(" "), /priority must be/);
  assert.deepEqual(buildResponsiveHandoff({}).layouts, []);
});
