import React, { useMemo, useState } from "react";
import {
  buildLatentSvgFilename,
  createLatentVariations,
  GAN_EXAMPLE_INPUT,
  GAN_RESET_INPUT,
  GAN_STYLES,
  generateLatentSample,
  serializeLatentSvg
} from "./ganLatentModel.js";

function color({ hue, saturation, lightness }) {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function polygonPoints(shape) {
  const points = [];
  for (let index = 0; index < shape.sides; index += 1) {
    const angle = (Math.PI * 2 * index) / shape.sides - Math.PI / 2;
    points.push(`${shape.cx + Math.cos(angle) * shape.width / 2},${shape.cy + Math.sin(angle) * shape.height / 2}`);
  }
  return points.join(" ");
}

export function LatentArtwork({ sample, title }) {
  const background = `hsl(${sample.backgroundHue} 35% 12%)`;
  return (
    <svg className="latent-artwork" viewBox="0 0 100 100" role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="100" height="100" fill={background} />
      {sample.shapes.map((shape) => {
        const fill = color(sample.palette[shape.paletteIndex]);
        const transform = `rotate(${shape.rotation} ${shape.cx} ${shape.cy})`;
        if (shape.kind === "circle") {
          return <circle key={shape.id} cx={shape.cx} cy={shape.cy} r={shape.width / 2} fill={fill} opacity={shape.opacity} />;
        }
        if (shape.kind === "ellipse") {
          return <ellipse key={shape.id} cx={shape.cx} cy={shape.cy} rx={shape.width / 2} ry={shape.height / 2} fill={fill} opacity={shape.opacity} transform={transform} />;
        }
        if (shape.kind === "rect") {
          return <rect key={shape.id} x={shape.cx - shape.width / 2} y={shape.cy - shape.height / 2} width={shape.width} height={shape.height} rx="3" fill={fill} opacity={shape.opacity} transform={transform} />;
        }
        return <polygon key={shape.id} points={polygonPoints(shape)} fill={fill} opacity={shape.opacity} transform={transform} />;
      })}
    </svg>
  );
}

export default function GanLatentGallery() {
  const [input, setInput] = useState({ ...GAN_RESET_INPUT });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const result = useMemo(() => generateLatentSample(input), [input]);
  const variations = useMemo(() => result.valid ? createLatentVariations(input, 4) : [], [input, result.valid]);
  const samples = useMemo(() => result.valid
    ? [result.sample, ...variations.map((variation) => variation.sample)]
    : [], [result, variations]);
  const selectedSample = samples[Math.min(selectedIndex, Math.max(0, samples.length - 1))] || null;

  const update = (key) => (event) => {
    setInput((current) => ({ ...current, [key]: event.target.value }));
    setSelectedIndex(0);
    setExportStatus("");
  };

  const loadExample = () => {
    setInput({ ...GAN_EXAMPLE_INPUT });
    setSelectedIndex(0);
    setExportStatus("");
  };

  const reset = () => {
    setInput({ ...GAN_RESET_INPUT });
    setSelectedIndex(0);
    setExportStatus("");
  };

  const selectSample = (index) => {
    setSelectedIndex(index);
    setExportStatus("");
  };

  const downloadSelectedSvg = () => {
    if (!selectedSample) return;
    const svg = serializeLatentSvg(selectedSample, {
      title: `Abstract background ${selectedSample.signature}`
    });
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = buildLatentSvgFilename(selectedSample);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setExportStatus(`${link.download} downloaded with seed and coordinate metadata.`);
  };

  return (
    <section className="interactive-lab gan-latent-gallery" aria-labelledby="gan-lab-title">
      <header className="lab-tool-header">
        <h2 id="gan-lab-title">GAN Latent Gallery</h2>
        <p>Create a reusable abstract background by exploring nearby latent coordinates, selecting one result, and exporting it as SVG. This is a deterministic simulation for designers and students—not a trained GAN or AI model.</p>
      </header>

      <div className="lab-workspace">
        <form className="lab-control-panel" onSubmit={(event) => event.preventDefault()}>
          <fieldset>
            <legend>Latent coordinates</legend>
            <label htmlFor="gan-x">X coordinate: {input.x}</label>
            <input id="gan-x" type="range" min="-10" max="10" step="0.1" value={input.x} onChange={update("x")} />
            <label htmlFor="gan-y">Y coordinate: {input.y}</label>
            <input id="gan-y" type="range" min="-10" max="10" step="0.1" value={input.y} onChange={update("y")} />
          </fieldset>

          <label htmlFor="gan-seed">Seed</label>
          <input id="gan-seed" type="text" maxLength="40" value={input.seed} onChange={update("seed")} />

          <label htmlFor="gan-style">Visual style</label>
          <select id="gan-style" value={input.style} onChange={update("style")}>
            {Object.entries(GAN_STYLES).map(([value, style]) => <option key={value} value={value}>{style.label}</option>)}
          </select>

          <div className="lab-actions">
            <button type="button" onClick={loadExample}>Load example</button>
            <button type="button" onClick={reset}>Reset</button>
          </div>
        </form>

        <div className="lab-output" aria-live="polite">
          {!result.valid ? (
            <div className="lab-errors" role="alert">
              <h3>Check the controls</h3>
              <ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          ) : (
            <>
              <section aria-labelledby="gan-selected-title">
                <h3 id="gan-selected-title">Selected reusable background</h3>
                <LatentArtwork sample={selectedSample} title={`Selected abstract background ${selectedSample.signature}`} />
                <p className="output-caption">
                  <strong>{selectedIndex === 0 ? "Main sample" : `Nearby variation ${selectedIndex}`}</strong>
                  {" "}selected: <code>{selectedSample.signature}</code> at ({selectedSample.coordinates.x}, {selectedSample.coordinates.y}).
                </p>
                <button type="button" onClick={downloadSelectedSvg}>Download selected SVG</button>
                <p role="status" aria-live="polite">{exportStatus}</p>
              </section>

              <div className="variation-gallery" role="list" aria-label="Choose a main or nearby latent-space sample">
                {samples.map((sample, index) => (
                  <div role="listitem" key={sample.signature}>
                    <button
                      type="button"
                      className="latent-sample-choice"
                      data-selected={selectedIndex === index}
                      aria-pressed={selectedIndex === index}
                      onClick={() => selectSample(index)}
                    >
                      <LatentArtwork sample={sample} title={index === 0 ? "Main sample" : `Nearby variation ${index}`} />
                      <span>{index === 0 ? "Main" : `Variation ${index}`} · {sample.coordinates.x.toFixed(1)}, {sample.coordinates.y.toFixed(1)}</span>
                      {selectedIndex === index && <strong>Selected</strong>}
                    </button>
                  </div>
                ))}
              </div>
              <p className="learning-note">The SVG export includes an accessible title and deterministic seed, style, coordinate, and signature metadata so the background can be reproduced.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
