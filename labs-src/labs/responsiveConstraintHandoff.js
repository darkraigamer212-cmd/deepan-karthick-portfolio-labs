const MAX_COMPONENTS = 20;
const MAX_VIEWPORTS = 8;
const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
const INTERACTIONS = new Set(["navigation", "input", "action", "content", "decorative"]);

export const RESPONSIVE_HANDOFF_EXAMPLE = {
  screenTask: "Let a customer search available appointments, compare times, and confirm one booking.",
  viewportWidths: "360, 768, 1024, 1440",
  componentInventory: "Primary navigation|critical|280|navigation\nSearch filters|critical|320|input\nAvailable times|high|360|content\nBooking summary|high|280|content\nConfirm booking|critical|180|action\nPromotional banner|low|300|decorative"
};

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "component";
}

export function parseViewportWidths(text) {
  const raw = String(text ?? "").split(/[,\s]+/).filter(Boolean);
  const errors = [];
  if (!raw.length) errors.push("Add at least one viewport width.");
  if (raw.length > MAX_VIEWPORTS) errors.push(`Use at most ${MAX_VIEWPORTS} viewport widths.`);
  const widths = raw.map(Number);
  widths.forEach((width, index) => {
    if (!Number.isInteger(width) || width < 240 || width > 3840) errors.push(`Viewport ${index + 1} must be a whole number from 240 to 3840 pixels.`);
  });
  return { widths: [...new Set(widths)].sort((a, b) => a - b), errors };
}

export function parseComponentInventory(text) {
  const lines = String(text ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = [];
  if (!lines.length) errors.push("Add at least one component row.");
  if (lines.length > MAX_COMPONENTS) errors.push(`Use at most ${MAX_COMPONENTS} component rows.`);
  const components = [];
  const names = new Set();
  lines.slice(0, MAX_COMPONENTS).forEach((line, index) => {
    const [name, priority, minWidthText, interaction, ...extra] = line.split("|").map((part) => part.trim());
    if (!name || !priority || !minWidthText || !interaction || extra.length) {
      errors.push(`Row ${index + 1}: use name|priority|minimum width|interaction type.`);
      return;
    }
    const key = name.toLowerCase();
    if (names.has(key)) errors.push(`Row ${index + 1}: duplicate component name “${name}”.`);
    names.add(key);
    if (!Object.hasOwn(PRIORITY_RANK, priority)) errors.push(`Row ${index + 1}: priority must be critical, high, medium, or low.`);
    if (!INTERACTIONS.has(interaction)) errors.push(`Row ${index + 1}: interaction must be navigation, input, action, content, or decorative.`);
    const minWidth = Number(minWidthText);
    if (!Number.isInteger(minWidth) || minWidth < 80 || minWidth > 1600) errors.push(`Row ${index + 1}: minimum width must be 80–1600 pixels.`);
    if (Object.hasOwn(PRIORITY_RANK, priority) && INTERACTIONS.has(interaction) && Number.isInteger(minWidth) && minWidth >= 80 && minWidth <= 1600) {
      components.push({ name, slug: slugify(name), priority, minWidth, interaction, order: index + 1 });
    }
  });
  return { components, errors };
}

export function validateResponsiveHandoff(input = {}) {
  const errors = {};
  if (String(input.screenTask ?? "").trim().length < 20) errors.screenTask = "Describe the screen’s user task in at least 20 characters.";
  const viewports = parseViewportWidths(input.viewportWidths);
  const inventory = parseComponentInventory(input.componentInventory);
  if (viewports.errors.length) errors.viewportWidths = viewports.errors;
  if (inventory.errors.length) errors.componentInventory = inventory.errors;
  return { errors, widths: viewports.widths, components: inventory.components };
}

function shouldNeverHide(component) {
  return component.priority === "critical" || ["navigation", "input", "action"].includes(component.interaction);
}

function packRows(components, availableWidth, gap = 16) {
  const rows = [];
  let current = [];
  let used = 0;
  components.forEach((component) => {
    const nextWidth = current.length ? used + gap + component.minWidth : component.minWidth;
    if (current.length && nextWidth > availableWidth) {
      rows.push(current);
      current = [component];
      used = component.minWidth;
    } else {
      current.push(component);
      used = nextWidth;
    }
  });
  if (current.length) rows.push(current);
  return rows;
}

export function buildResponsiveHandoff(input) {
  const validated = validateResponsiveHandoff(input);
  if (Object.keys(validated.errors).length) return { errors: validated.errors, layouts: [], checklist: [], cssStarter: "" };
  const { widths, components } = validated;
  const focusOrder = components.filter((component) => component.interaction !== "content" && component.interaction !== "decorative")
    .map((component, index) => ({ position: index + 1, name: component.name, interaction: component.interaction }));

  const layouts = widths.map((viewport) => {
    const availableWidth = Math.max(0, viewport - 32);
    const collisionWarnings = components
      .filter((component) => component.minWidth > availableWidth)
      .map((component) => `${component.name} requires ${component.minWidth}px but only ${availableWidth}px is available.`);
    let visible = [...components];
    let rows = packRows(visible, availableWidth);
    const hidden = [];
    if (rows.length > 3) {
      const hideCandidates = components
        .filter((component) => !shouldNeverHide(component) && component.priority === "low")
        .sort((left, right) => PRIORITY_RANK[right.priority] - PRIORITY_RANK[left.priority] || right.order - left.order);
      for (const candidate of hideCandidates) {
        hidden.push(candidate);
        visible = visible.filter((component) => component !== candidate);
        rows = packRows(visible, availableWidth);
        if (rows.length <= 3) break;
      }
    }
    const decisions = components.map((component) => ({
      name: component.name,
      decision: hidden.includes(component)
        ? "Hide at this width; it is low-priority and non-interactive."
        : shouldNeverHide(component)
          ? `Never hide; preserve DOM order ${component.order} and reflow to its own row if needed.`
          : `Keep visible and reflow after higher-priority content; preserve DOM order ${component.order}.`
    }));
    return {
      viewport,
      availableWidth,
      feasible: collisionWarnings.length === 0,
      rows: rows.map((row) => row.map((component) => component.name)),
      hidden: hidden.map((component) => component.name),
      decisions,
      collisionWarnings
    };
  });

  const checklist = [
    "Use one DOM order matching the documented keyboard order; change visual placement with Grid, never tabindex values.",
    "Verify no critical, navigation, input, or action component is hidden at any supplied viewport.",
    "Test at each supplied width and at ±1 pixel to expose collisions near a constraint boundary.",
    "Zoom to 200%, enlarge text, and confirm components reflow without horizontal page scrolling.",
    "Complete the primary task using keyboard only; confirm visible focus and logical focus return after dialogs.",
    "Check labels, errors, touch targets, content truncation, and reduced-motion behavior.",
    "Record intentional hidden decorative content and confirm no information or action is lost."
  ];
  return { errors: {}, layouts, focusOrder, checklist, cssStarter: buildCssStarter(components, widths) };
}

export function buildCssStarter(components, widths) {
  const smallestComponent = Math.min(...components.map((component) => component.minWidth));
  const smallestViewport = Math.min(...widths);
  const optionalSelectors = components.filter((component) => !shouldNeverHide(component) && component.priority === "low")
    .map((component) => `.constraint-${component.slug}`);
  const lines = [
    ".constraint-layout {",
    "  display: grid;",
    `  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${smallestComponent}px), 1fr));`,
    "  gap: 1rem;",
    "  align-items: start;",
    "}",
    "",
    ".constraint-layout > * { min-width: 0; }",
    ".constraint-layout :focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }"
  ];
  if (optionalSelectors.length) {
    lines.push("", `@media (max-width: ${smallestViewport}px) {`, `  ${optionalSelectors.join(",\n  ")} { display: none; }`, "}");
  }
  return lines.join("\n");
}

export { MAX_COMPONENTS, MAX_VIEWPORTS };
