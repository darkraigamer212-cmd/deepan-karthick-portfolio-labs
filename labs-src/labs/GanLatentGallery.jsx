import React, { useMemo, useState } from "react";
import {
  createLatentVariations,
  GAN_EXAMPLE_INPUT,
  GAN_RESET_INPUT,
  GAN_STYLES,
  generateLatentSample
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
  const result = useMemo(() => generateLatentSample(input), [input]);
  const variations = useMemo(() => result.valid ? createLatentVariations(input, 4) : [], [input, result.valid]);

  const update = (key) => (event) => setInput((current) => ({ ...current, [key]: event.target.value }));

  return (
    <section className="interactive-lab gan-latent-gallery" aria-labelledby="gan-lab-title">
      <header className="lab-tool-header">
        <h2 id="gan-lab-title">GAN Latent Gallery</h2>
        <p>This is a lightweight, deterministic latent-space simulation for learning. It is not a trained GAN and does not use an AI model.</p>
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
            <button type="button" onClick={() => setInput({ ...GAN_EXAMPLE_INPUT })}>Load example</button>
            <button type="button" onClick={() => setInput({ ...GAN_RESET_INPUT })}>Reset</button>
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
              <LatentArtwork sample={result.sample} title={`Generated abstract sample ${result.sample.signature}`} />
              <p className="output-caption">Sample <code>{result.sample.signature}</code> at ({result.sample.coordinates.x}, {result.sample.coordinates.y})</p>
              <div className="variation-gallery" aria-label="Nearby latent-space variations">
                {variations.map(({ sample }, index) => (
                  <figure key={sample.signature}>
                    <LatentArtwork sample={sample} title={`Variation ${index + 1}`} />
                    <figcaption>{sample.coordinates.x.toFixed(1)}, {sample.coordinates.y.toFixed(1)}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

