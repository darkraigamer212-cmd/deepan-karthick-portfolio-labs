import React, { useMemo, useState } from "react";
import {
  cloneGrid,
  CNN_KERNELS,
  CNN_PRESETS,
  convolveGrid,
  createBlankGrid,
  normalizeFeatureMap
} from "./cnnConvolution.js";

function PixelGrid({ grid, onChange }) {
  return (
    <div className="pixel-grid" role="group" aria-label="Editable 5 by 5 grayscale pixel grid">
      {grid.flatMap((row, rowIndex) => row.map((value, columnIndex) => (
        <label className="pixel-cell" key={`${rowIndex}-${columnIndex}`}>
          <span className="visually-hidden">Row {rowIndex + 1}, column {columnIndex + 1}</span>
          <input
            type="number"
            min="0"
            max="255"
            step="1"
            value={value}
            aria-label={`Pixel row ${rowIndex + 1}, column ${columnIndex + 1}`}
            onChange={(event) => onChange(rowIndex, columnIndex, event.target.value)}
          />
        </label>
      )))}
    </div>
  );
}

export default function CnnFeatureExplorer() {
  const [grid, setGrid] = useState(() => cloneGrid(CNN_PRESETS.diagonal));
  const [kernelName, setKernelName] = useState("edge");
  const [presetName, setPresetName] = useState("diagonal");
  const result = useMemo(() => convolveGrid(grid, kernelName), [grid, kernelName]);
  const normalized = useMemo(() => result.valid ? normalizeFeatureMap(result.featureMap) : null, [result]);

  const updatePixel = (rowIndex, columnIndex, value) => {
    setPresetName("custom");
    setGrid((current) => current.map((row, currentRow) => (
      row.map((pixel, currentColumn) => currentRow === rowIndex && currentColumn === columnIndex ? value : pixel)
    )));
  };

  const loadPreset = (name) => {
    setPresetName(name);
    setGrid(cloneGrid(CNN_PRESETS[name]));
  };

  return (
    <section className="interactive-lab cnn-feature-explorer" aria-labelledby="cnn-lab-title">
      <header className="lab-tool-header">
        <h2 id="cnn-lab-title">CNN Feature Explorer</h2>
        <p>Edit the grayscale pixels, then compare how a 3 × 3 convolution kernel transforms local patterns into a feature map.</p>
      </header>

      <div className="lab-control-strip">
        <label htmlFor="cnn-preset">Input preset</label>
        <select id="cnn-preset" value={presetName} onChange={(event) => loadPreset(event.target.value)}>
          <option value="custom" disabled>Custom / blank</option>
          {Object.keys(CNN_PRESETS).map((name) => <option key={name} value={name}>{name[0].toUpperCase() + name.slice(1)}</option>)}
        </select>
        <label htmlFor="cnn-kernel">Kernel</label>
        <select id="cnn-kernel" value={kernelName} onChange={(event) => setKernelName(event.target.value)}>
          {Object.entries(CNN_KERNELS).map(([name, kernel]) => <option key={name} value={name}>{kernel.label}</option>)}
        </select>
        <button type="button" onClick={() => loadPreset("diagonal")}>Load example</button>
        <button type="button" onClick={() => { setPresetName("custom"); setGrid(createBlankGrid()); }}>Reset</button>
      </div>

      <div className="cnn-workspace">
        <section aria-labelledby="pixel-input-title">
          <h3 id="pixel-input-title">Input pixels (0–255)</h3>
          <PixelGrid grid={grid} onChange={updatePixel} />
        </section>

        <section aria-labelledby="kernel-title">
          <h3 id="kernel-title">{CNN_KERNELS[kernelName].label} kernel</h3>
          <div className="kernel-grid" aria-label={`${CNN_KERNELS[kernelName].label} kernel values`}>
            {CNN_KERNELS[kernelName].matrix.flat().map((value, index) => <output key={index}>{value}</output>)}
          </div>
          {CNN_KERNELS[kernelName].divisor !== 1 && <p>Divide the weighted sum by {CNN_KERNELS[kernelName].divisor}.</p>}
        </section>

        <section aria-labelledby="feature-output-title" aria-live="polite">
          <h3 id="feature-output-title">3 × 3 feature map</h3>
          {!result.valid ? (
            <div className="lab-errors" role="alert"><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div>
          ) : (
            <div className="feature-map" aria-label="Convolution output values">
              {result.featureMap.flatMap((row, rowIndex) => row.map((value, columnIndex) => {
                const intensity = Math.round(normalized[rowIndex][columnIndex] * 100);
                return (
                  <output
                    key={`${rowIndex}-${columnIndex}`}
                    aria-label={`Feature row ${rowIndex + 1}, column ${columnIndex + 1}: ${value}`}
                    style={{ "--feature-intensity": `${intensity}%` }}
                  >
                    {value}
                  </output>
                );
              }))}
            </div>
          )}
        </section>
      </div>

      <p className="learning-note">This explorer uses one valid convolution pass with stride 1 and no padding. It demonstrates CNN-style feature extraction locally; it is not a trained neural network.</p>
    </section>
  );
}
