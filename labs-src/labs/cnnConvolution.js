export const CNN_KERNELS = Object.freeze({
  edge: Object.freeze({
    label: "Edge detection",
    divisor: 1,
    matrix: Object.freeze([
      Object.freeze([-1, -1, -1]),
      Object.freeze([-1, 8, -1]),
      Object.freeze([-1, -1, -1])
    ])
  }),
  sharpen: Object.freeze({
    label: "Sharpen",
    divisor: 1,
    matrix: Object.freeze([
      Object.freeze([0, -1, 0]),
      Object.freeze([-1, 5, -1]),
      Object.freeze([0, -1, 0])
    ])
  }),
  blur: Object.freeze({
    label: "Box blur",
    divisor: 9,
    matrix: Object.freeze([
      Object.freeze([1, 1, 1]),
      Object.freeze([1, 1, 1]),
      Object.freeze([1, 1, 1])
    ])
  })
});

export const CNN_PRESETS = Object.freeze({
  diagonal: Object.freeze([
    Object.freeze([255, 20, 0, 0, 0]),
    Object.freeze([20, 255, 20, 0, 0]),
    Object.freeze([0, 20, 255, 20, 0]),
    Object.freeze([0, 0, 20, 255, 20]),
    Object.freeze([0, 0, 0, 20, 255])
  ]),
  cross: Object.freeze([
    Object.freeze([0, 0, 220, 0, 0]),
    Object.freeze([0, 0, 220, 0, 0]),
    Object.freeze([220, 220, 255, 220, 220]),
    Object.freeze([0, 0, 220, 0, 0]),
    Object.freeze([0, 0, 220, 0, 0])
  ]),
  checkerboard: Object.freeze([
    Object.freeze([240, 20, 240, 20, 240]),
    Object.freeze([20, 240, 20, 240, 20]),
    Object.freeze([240, 20, 240, 20, 240]),
    Object.freeze([20, 240, 20, 240, 20]),
    Object.freeze([240, 20, 240, 20, 240])
  ])
});

export function createBlankGrid() {
  return Array.from({ length: 5 }, () => Array(5).fill(0));
}

export function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

export function validatePixelGrid(grid) {
  if (!Array.isArray(grid) || grid.length !== 5 || grid.some((row) => !Array.isArray(row) || row.length !== 5)) {
    return ["Pixel input must be a 5 by 5 grid."];
  }

  const errors = [];
  grid.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    const numeric = typeof value === "number" ? value : Number(value);
    const location = `Row ${rowIndex + 1}, column ${columnIndex + 1}`;
    if (value === "" || !Number.isFinite(numeric)) errors.push(`${location} must be a valid number.`);
    else if (numeric < 0 || numeric > 255) errors.push(`${location} must be between 0 and 255.`);
  }));
  return errors;
}

function normalizeGrid(grid) {
  return grid.map((row) => row.map(Number));
}

function round(value, places = 2) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

export function convolveGrid(grid, kernelName) {
  const errors = validatePixelGrid(grid);
  const kernel = CNN_KERNELS[kernelName];
  if (!kernel) errors.push("Choose a supported convolution kernel.");
  if (errors.length) return { valid: false, errors, featureMap: null };

  const pixels = normalizeGrid(grid);
  const featureMap = Array.from({ length: 3 }, (_, outputRow) => (
    Array.from({ length: 3 }, (_, outputColumn) => {
      let sum = 0;
      for (let kernelRow = 0; kernelRow < 3; kernelRow += 1) {
        for (let kernelColumn = 0; kernelColumn < 3; kernelColumn += 1) {
          sum += pixels[outputRow + kernelRow][outputColumn + kernelColumn] * kernel.matrix[kernelRow][kernelColumn];
        }
      }
      return round(sum / kernel.divisor);
    })
  ));

  return { valid: true, errors: [], featureMap };
}

export function normalizeFeatureMap(featureMap) {
  const values = featureMap.flat();
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return featureMap.map((row) => row.map(() => 0.5));
  return featureMap.map((row) => row.map((value) => round((value - minimum) / (maximum - minimum), 4)));
}

