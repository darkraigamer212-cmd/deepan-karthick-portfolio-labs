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
  "ml-model-lab": lazy(() => import("./labs/MlModelLab.jsx")),
  "cloud-regret-premortem": lazy(() => import("./labs/CloudRegretPremortem.jsx")),
  "aws-outage-storyboard": lazy(() => import("./labs/AwsCustomerJourneyOutageStoryboard.jsx")),
  "azure-access-handoff": lazy(() => import("./labs/AzureAccessHandoffSimulator.jsx")),
  "gcp-promise-ledger": lazy(() => import("./labs/GcpTransformationPromiseLedger.jsx")),
  "responsive-constraint-handoff": lazy(() => import("./labs/ResponsiveConstraintHandoff.jsx")),
  "exception-first-python-automator": lazy(() => import("./labs/ExceptionFirstPythonAutomator.jsx")),
  "queue-fairness-replay": lazy(() => import("./labs/QueueFairnessReplay.jsx")),
  "safe-c-input-harness": lazy(() => import("./labs/SafeCInputHarness.jsx")),
  "csv-claim-stress-tester": lazy(() => import("./labs/CsvClaimStressTester.jsx")),
  "llm-data-contract-firewall": lazy(() => import("./labs/LlmDataContractFirewall.jsx")),
  "shortage-response-tradeoff": lazy(() => import("./labs/ShortageResponseTradeoffLab.jsx")),
  "lp-exit-rehearsal": lazy(() => import("./labs/LpExitRehearsal.jsx")),
  "account-recovery-drill": lazy(() => import("./labs/AccountRecoveryDrillComposer.jsx")),
  "feature-misuse-contract": lazy(() => import("./labs/FeatureMisuseContract.jsx")),
  "share-link-afterlife": lazy(() => import("./labs/ShareLinkAfterlifeRehearsal.jsx")),
  "network-change-rollback": lazy(() => import("./labs/NetworkChangeRollbackComposer.jsx")),
  "proof-to-interview-compiler": lazy(() => import("./labs/ProofToInterviewCompiler.jsx")),
  "containment-side-effect-ledger": lazy(() => import("./labs/ContainmentSideEffectLedger.jsx")),
  "detection-contract-drift-guard": lazy(() => import("./labs/DetectionContractDriftGuard.jsx")),
  "assurance-change-shockwave": lazy(() => import("./labs/AssuranceChangeShockwaveMapper.jsx"))
};

const categoryLabels = {
  "ai-ml": "AI & ML",
  cloud: "Cloud & Networking",
  "software-data": "Programming & Data",
  "business-finance": "Business & Finance",
  cybersecurity: "Cybersecurity"
};

const categoryOrder = ["ai-ml", "cloud", "software-data", "business-finance", "cybersecurity"];

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
          <a href="../docs/generated/karthik_ats_resume.pdf">Resume</a>
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

  const categoryGroups = useMemo(() => categoryOrder.map((categoryKey) => ({
    key: categoryKey,
    label: categoryLabels[categoryKey],
    total: manifest.labs.filter((lab) => lab.category === categoryKey).length,
    labs: visibleLabs.filter((lab) => lab.category === categoryKey)
  })).filter((group) => group.labs.length), [visibleLabs]);

  const functionalCount = manifest.labs.filter((lab) => lab.status === "functional").length;
  const functionalPercent = Math.round((functionalCount / manifest.labs.length) * 100);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <main className="catalog-page">
      <section className="intro" aria-labelledby="catalog-title">
        <div className="intro-copy">
          <p className="eyebrow">Applied learning / working software</p>
          <h1 id="catalog-title">30 certificates.<br />30 working prototypes.</h1>
          <p className="intro-summary">Each Applied Lab turns a completed certificate into a practical, testable project. Explore the real tools, review their methods, and open any prototype directly.</p>

          <dl className="catalog-stats" aria-label="Catalog totals">
            <div><dt>{manifest.labs.length}</dt><dd>Applied labs</dd></div>
            <div><dt>{categoryOrder.length}</dt><dd>Skill areas</dd></div>
            <div><dt>{manifest.credentialCount}</dt><dd>Certificates</dd></div>
            <div><dt>{functionalPercent}%</dt><dd>Functional</dd></div>
          </dl>
        </div>

        <aside className="catalog-principles" aria-label="Project principles">
          <p className="principles-title">Project principles</p>
          <dl>
            <div><dt>Local-first</dt><dd>Browser-based prototypes</dd></div>
            <div><dt>Tested</dt><dd>Deterministic verification</dd></div>
            <div><dt>Documented</dt><dd>Methods and limits included</dd></div>
          </dl>
        </aside>
      </section>

      <section className="controls" aria-label="Filter labs">
        <div className="catalog-search">
          <label className="visually-hidden" htmlFor="lab-search">Search applied labs</label>
          <input
            id="lab-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search project or certificate"
          />
        </div>

        <div className="category-filters" role="group" aria-label="Filter by skill area">
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>All</button>
          {categoryOrder.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {categoryLabels[value]}
            </button>
          ))}
        </div>

        <output aria-live="polite">Showing {visibleLabs.length} of {manifest.labs.length}</output>
      </section>

      <section className="catalog-lanes" aria-label="Applied labs by skill area">
        {categoryGroups.map((group) => (
          <section className="category-lane" data-category={group.key} key={group.key} aria-labelledby={`category-${group.key}`}>
            <header className="category-rail">
              <span className="category-index" aria-hidden="true">{String(categoryOrder.indexOf(group.key) + 1).padStart(2, "0")}</span>
              <div>
                <h2 id={`category-${group.key}`}>{group.label}</h2>
                <p>{group.total} {group.total === 1 ? "project" : "projects"} in this area</p>
              </div>
            </header>

            <div className="category-projects">
              {group.labs.map((lab) => (
                <article className="lab-row" key={lab.id}>
                  <span className="lab-number">{String(lab.id).padStart(2, "0")}</span>
                  <div className="lab-summary">
                    <h3><a href={`#/lab/${lab.slug}`}>{lab.project}</a></h3>
                    <p>{lab.credential}</p>
                  </div>
                  <span className="lab-status">{lab.status}</span>
                  <a className="open-lab" href={`#/lab/${lab.slug}`} aria-label={`Open ${lab.project}`}>Open lab</a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      {!visibleLabs.length && (
        <div className="empty-state">
          <p role="status">No labs match that search and category.</p>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      <footer className="catalog-footer">
        <p>All {manifest.labs.length} projects are functional and backed by completed certificates.</p>
        <strong>Built to solve. Tested to prove. Documented to last.</strong>
        <a href="#catalog-title">Back to top</a>
      </footer>
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
