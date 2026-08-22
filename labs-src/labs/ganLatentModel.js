const MAX_COORDINATE = 10;
const MAX_SEED_LENGTH = 40;

export const GAN_STYLES = Object.freeze({
  orbit: Object.freeze({ label: "Orbital bloom", saturation: 72, lightness: 58 }),
  mosaic: Object.freeze({ label: "Geometric mosaic", saturation: 64, lightness: 54 }),
  ripple: Object.freeze({ label: "Soft ripple", saturation: 58, lightness: 64 })
});

export const GAN_EXAMPLE_INPUT = Object.freeze({
  x: 2.4,
  y: -1.8,
  seed: "deepan-lab-03",
  style: "orbit"
});

export const GAN_RESET_INPUT = Object.freeze({
  x: 0,
  y: 0,
  seed: "latent-demo",
  style: "orbit"
});

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value, places = 3) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

export function validateLatentInput(input) {
  const errors = [];
  const x = typeof input?.x === "number" ? input.x : Number(input?.x);
  const y = typeof input?.y === "number" ? input.y : Number(input?.y);
  const seed = String(input?.seed ?? "").trim();

  if (!Number.isFinite(x)) errors.push("X coordinate must be a valid number.");
  else if (Math.abs(x) > MAX_COORDINATE) errors.push(`X coordinate must be between -${MAX_COORDINATE} and ${MAX_COORDINATE}.`);

  if (!Number.isFinite(y)) errors.push("Y coordinate must be a valid number.");
  else if (Math.abs(y) > MAX_COORDINATE) errors.push(`Y coordinate must be between -${MAX_COORDINATE} and ${MAX_COORDINATE}.`);

  if (!seed) errors.push("Seed is required.");
  else if (seed.length > MAX_SEED_LENGTH) errors.push(`Seed must be ${MAX_SEED_LENGTH} characters or fewer.`);

  if (!Object.hasOwn(GAN_STYLES, input?.style)) errors.push("Choose a supported visual style.");
  return errors;
}

export function generateLatentSample(input) {
  const errors = validateLatentInput(input);
  if (errors.length) return { valid: false, errors, sample: null };

  const x = Number(input.x);
  const y = Number(input.y);
  const seed = String(input.seed).trim();
  const style = GAN_STYLES[input.style];
  const random = mulberry32(hashString(`${seed}|${input.style}|${x.toFixed(4)}|${y.toFixed(4)}`));
  const baseHue = Math.round((hashString(seed) % 360 + (x + MAX_COORDINATE) * 11 + (y + MAX_COORDINATE) * 7) % 360);
  const palette = Array.from({ length: 4 }, (_, index) => ({
    hue: Math.round((baseHue + index * (42 + random() * 28)) % 360),
    saturation: Math.round(style.saturation + random() * 12 - 6),
    lightness: Math.round(style.lightness + random() * 14 - 7)
  }));

  const shapeKinds = input.style === "mosaic"
    ? ["rect", "polygon"]
    : input.style === "ripple"
      ? ["circle", "ellipse"]
      : ["circle", "ellipse", "polygon"];

  const shapes = Array.from({ length: 9 }, (_, index) => {
    const width = 20 + random() * 52;
    const height = 20 + random() * 52;
    const centerX = 12 + random() * 76 + Math.sin(x + index) * 4;
    const centerY = 12 + random() * 76 + Math.cos(y - index) * 4;
    const sides = 3 + Math.floor(random() * 4);
    return {
      id: `${index}-${Math.round(random() * 1_000_000)}`,
      kind: shapeKinds[Math.floor(random() * shapeKinds.length)],
      cx: round(Math.min(94, Math.max(6, centerX))),
      cy: round(Math.min(94, Math.max(6, centerY))),
      width: round(width),
      height: round(height),
      rotation: round(random() * 360 + x * 8 - y * 5),
      opacity: round(0.3 + random() * 0.5),
      paletteIndex: index % palette.length,
      sides
    };
  });

  return {
    valid: true,
    errors: [],
    sample: {
      signature: `${hashString(`${seed}:${x}:${y}:${input.style}`).toString(16).padStart(8, "0")}`,
      backgroundHue: (baseHue + 200) % 360,
      palette,
      shapes,
      coordinates: { x, y },
      seed,
      style: input.style
    }
  };
}

export function createLatentVariations(input, count = 4, distance = 0.9) {
  const requestedCount = Math.max(1, Math.min(8, Math.trunc(Number(count) || 0)));
  const offsets = [
    [distance, 0],
    [0, distance],
    [-distance, 0],
    [0, -distance],
    [distance, distance],
    [-distance, distance],
    [-distance, -distance],
    [distance, -distance]
  ];

  return offsets.slice(0, requestedCount).map(([deltaX, deltaY]) => {
    const variationInput = {
      ...input,
      x: Math.min(MAX_COORDINATE, Math.max(-MAX_COORDINATE, Number(input.x) + deltaX)),
      y: Math.min(MAX_COORDINATE, Math.max(-MAX_COORDINATE, Number(input.y) + deltaY))
    };
    return generateLatentSample(variationInput);
  });
}

