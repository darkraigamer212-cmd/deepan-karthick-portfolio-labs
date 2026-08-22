import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import manifest from "../docs/project-control/project-manifest.json";
import "./styles.css";

const implementedLabs = {
  "ai-workflow-canvas": lazy(() => import("./labs/AIWorkflowCanvas.jsx")),
  "mini-rag-studio": lazy(() => import("./labs/MiniRagStudio.jsx")),
  "gan-latent-gallery": lazy(() => import("./labs/GanLatentGallery.jsx")),
  "cnn-feature-explorer": lazy(() => import("./labs/CnnFeatureExplorer.jsx")),
  "attention-text-explorer": lazy(() => import("./labs/AttentionTextExplorer.jsx")),
  "neural-network-playground": lazy(() => import("./labs/NeuralNetworkPlayground.jsx")),
  "genai-lifecycle-explorer": lazy(() => import("./labs/GenAiLifecycleExplorer.jsx")),
  "ai-opportunity-scorer": lazy(() => import("./labs/AiOpportunityScorer.jsx")),
  "prompt-workbench": lazy(() => import("./labs/PromptWorkbench.jsx")),
  "ml-model-lab": lazy(() => import("./labs/MlModelLab.jsx"))
};

const categoryLabels = {
  "ai-ml": "AI & machine learning",
  cloud: "Cloud & networking",
  "software-data": "Programming & data",
  "business-finance": "Business & finance",
  cybersecurity: "Cybersecurity"
};

function getRoute() {
  const match = window.location.hash.match(/^#\/lab\/([^/?#]+)/);
  return match ? { type: "lab", slug: decodeURIComponent(match[1]) } : { type: "catalog" };
}

function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  const lab = route.type === "lab"
    ? manifest.labs.find((item) => item.slug === route.slug)
    : null;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#/">Deepan Karthick / Applied Labs</a>
        <nav aria-label="Primary navigation">
          <a href="#/">All labs</a>
          <a href="../portfolio/index.html">Portfolio</a>
        </nav>
      </header>
      {route.type === "lab" ? <LabRoute lab={lab} /> : <Catalog />}
    </div>
  );
}

function Catalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const visibleLabs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return manifest.labs.filter((lab) => {
      const matchesCategory = category === "all" || lab.category === category;
      const haystack = `${lab.project} ${lab.credential}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, query]);

  return (
    <main>
      <section className="intro">
        <h1>30 certificates. 30 working prototypes.</h1>
        <p>This functional catalog is the shared home for every certificate project. Visual polish comes after the models pass their tests.</p>
      </section>

      <section className="controls" aria-label="Filter labs">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search project or certificate"
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <output>{visibleLabs.length} of {manifest.credentialCount} labs</output>
      </section>

      <section className="lab-list" aria-label="Applied labs">
        {visibleLabs.map((lab) => (
          <article className="lab-row" key={lab.id}>
            <span className="lab-number">{String(lab.id).padStart(2, "0")}</span>
            <div>
              <h2><a href={`#/lab/${lab.slug}`}>{lab.project}</a></h2>
              <p>{lab.credential}</p>
            </div>
            <span className="lab-category">{categoryLabels[lab.category]}</span>
            <span className="lab-status">{lab.status}</span>
          </article>
        ))}
      </section>

      {!visibleLabs.length && <p className="empty-state">No labs match that search.</p>}
    </main>
  );
}

function LabRoute({ lab }) {
  if (!lab) {
    return (
      <main className="lab-detail">
        <a href="#/">Back to all labs</a>
        <h1>Lab not found</h1>
      </main>
    );
  }

  const LabComponent = implementedLabs[lab.slug];

  return (
    <main className="lab-detail">
      <a href="#/">Back to all labs</a>
      <p className="lab-id">Lab {String(lab.id).padStart(2, "0")}</p>
      <h1>{lab.project}</h1>
      <p><strong>Certificate:</strong> {lab.credential}</p>
      <dl>
        <div><dt>Category</dt><dd>{categoryLabels[lab.category]}</dd></div>
        <div><dt>Delivery batch</dt><dd>{lab.batch}</dd></div>
        <div><dt>Current status</dt><dd>{lab.status}</dd></div>
      </dl>
      {LabComponent ? (
        <Suspense fallback={<p className="implementation-notice" role="status">Loading functional model…</p>}>
          <LabComponent />
        </Suspense>
      ) : (
        <section className="implementation-notice">
          <h2>Functional model pending</h2>
          <p>This route is reserved and working. The interactive model will be implemented and tested in its assigned batch.</p>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
