import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, useReducedMotion } from "framer-motion";
import { animated, useSpring } from "@react-spring/web";
import gsap from "gsap";
import "./styles.css";

document.title = document.body.dataset.page === "links"
  ? "Deepan Karthick | Portfolio Links"
  : "Deepan Karthick | Software Portfolio";

const links = {
  home: "index.html",
  labs: "../labs/index.html",
  timber: "../timber-demo/index.html",
  erp: "https://lakshmipriya-erp-demo.industrious-keyboard.workers.dev/owner",
  atsResume: "../docs/generated/karthik_ats_resume.pdf",
  startupResume: "../docs/generated/karthik_startup_resume.pdf",
  certificates: "./assets/certificates/Deepan_K_Certificates_Combined.pdf",
  github: "https://github.com/darkraigamer212-cmd",
  repository: "https://github.com/darkraigamer212-cmd/career-application-kit",
  linkedin: "https://www.linkedin.com/in/deepan-karthick-166735374/"
};

const flagships = [
  {
    number: "01",
    tone: "forest",
    title: "Printing Press ERP",
    subtitle: "Operational software for a small printing business",
    screenshot: "./assets/screenshots/printing-erp-dashboard.png",
    alt: "Printing Press ERP owner dashboard showing fictional production orders",
    problem: "Printing work becomes difficult to coordinate when estimates, job stages, priorities, stock, invoices, and dispatch information live in separate notes.",
    proof: [
      "Fictional, browser-local public demo data",
      "Order status and priority changes persist across reloads",
      "Inventory, invoices, reports, and staff views",
      "Direct-route Cloudflare deployment verified"
    ],
    stack: "React · JavaScript · Supabase live mode · local demo store",
    href: links.erp,
    action: "Open live ERP"
  },
  {
    number: "02",
    tone: "orange",
    title: "Timber CFT Pro + Billing",
    subtitle: "Measurement and billing workflow for timber businesses",
    screenshot: "./assets/screenshots/timber-calculator.png",
    alt: "Timber CFT Pro measurement, calculation, and billing interface",
    problem: "Manual timber measurements and billing create avoidable conversion, pricing, tax, payment, and record-keeping errors.",
    proof: [
      "Locked business-inch CFT and raw-millimetre M3 rules",
      "Rates, discount, GST, payment, balance, and overpayment",
      "Browser-local save, search, reopen, and reset workflow",
      "Printable measurement statement and Save PDF flow"
    ],
    stack: "React · JavaScript · tested domain calculations · local history",
    href: links.timber,
    action: "Open Timber demo"
  }
];

const resourceLinks = [
  { label: "ATS Resume", detail: "One-page application resume", href: links.atsResume },
  { label: "Startup Resume", detail: "Project-focused resume", href: links.startupResume },
  { label: "Certificates", detail: "Combined completed-credential archive", href: links.certificates },
  { label: "GitHub", detail: "Code, documentation, and repositories", href: links.github },
  { label: "LinkedIn", detail: "Professional profile", href: links.linkedin }
];

function App() {
  const isLinksPage = document.body.dataset.page === "links";
  return (
    <div className="site-shell">
      {!isLinksPage ? <BackgroundFX /> : null}
      <Header linksPage={isLinksPage} />
      {isLinksPage ? <LinksPage /> : <HomePage />}
      <Footer />
    </div>
  );
}

function BackgroundFX() {
  const fieldRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const spring = useSpring({
    from: { transform: "translate3d(-8%, 5%, 0) scale(0.9)", opacity: 0.25 },
    to: { transform: "translate3d(6%, -4%, 0) scale(1.08)", opacity: 0.72 },
    loop: { reverse: true },
    config: { mass: 5, tension: 28, friction: 18 },
    immediate: reduceMotion
  });

  useEffect(() => {
    if (reduceMotion || !fieldRef.current) return undefined;
    const context = gsap.context(() => {
      gsap.to(".aurora-orb", {
        x: (_, element) => Number(element.dataset.x),
        y: (_, element) => Number(element.dataset.y),
        rotation: 14,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 1.4
      });
    }, fieldRef);
    return () => context.revert();
  }, [reduceMotion]);

  return (
    <div className="cosmic-field" ref={fieldRef} aria-hidden="true">
      <div className="aceternity-spotlight" />
      <div className="aurora-orb orb-cyan" data-x="80" data-y="-45" />
      <div className="aurora-orb orb-violet" data-x="-70" data-y="60" />
      <div className="aurora-orb orb-rose" data-x="45" data-y="55" />
      <animated.div className="spring-nebula" style={spring} />
      <div className="magic-beam beam-one" />
      <div className="magic-beam beam-two" />
      {Array.from({ length: 12 }, (_, index) => <i key={index} className={`meteor meteor-${index + 1}`} />)}
    </div>
  );
}

function Header({ linksPage }) {
  return (
    <header className="site-header">
      <a className="wordmark" href={linksPage ? links.home : "#top"}>Deepan Karthick</a>
      <nav aria-label="Primary navigation">
        <a href={linksPage ? `${links.home}#work` : "#work"}>Work</a>
        <a href={links.labs}>Applied Labs</a>
        <a href={linksPage ? `${links.home}#about` : "#about"}>About</a>
        <a href={links.atsResume}>Resume</a>
      </nav>
    </header>
  );
}

function HomePage() {
  return (
    <main id="top">
      <Hero />
      <Metrics />
      <FlagshipWork />
      <LabsRail />
      <ProfileSummary />
      <Resources />
    </main>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section className="hero page-frame" aria-labelledby="hero-title" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
      <motion.div className="hero-copy" whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ type: "spring", stiffness: 180, damping: 22 }}>
        <p className="hero-role">Software engineer / systems builder</p>
        <h1 id="hero-title">I build practical software for real business decisions.</h1>
        <p className="hero-lead">B.Sc. Computer Science with AI student building tested React tools, operational workflows, and local-first software for internships and startup projects.</p>
        <p className="availability"><span aria-hidden="true" />Available for software internships and startup projects</p>
        <div className="hero-actions">
          <a className="glass-action glass-action-primary" href="#work">Review flagship work <Arrow /></a>
          <a className="glass-action" href={links.labs}>Explore 30 Applied Labs <Arrow /></a>
        </div>
      </motion.div>
      <div className="hero-flagships" aria-label="Flagship software systems">
        <FlagshipPreview
          eyebrow="Production · orders · stock"
          title="Lakshmipriya ERP"
          summary="Operational workflows, inventory, invoicing, and reporting in one verifiable system."
          screenshot={flagships[0].screenshot}
          alt={flagships[0].alt}
          href={links.erp}
          tone="cyan"
        />
        <FlagshipPreview
          eyebrow="Measure · price · invoice"
          title="Timber CFT Pro"
          summary="Accurate timber measurement, business pricing, billing, and local customer history."
          screenshot={flagships[1].screenshot}
          alt={flagships[1].alt}
          href={links.timber}
          tone="magenta"
        />
      </div>
    </motion.section>
  );
}

function FlagshipPreview({ eyebrow, title, summary, screenshot, alt, href, tone }) {
  return (
    <motion.a className={`flagship-preview flagship-preview-${tone}`} href={href} whileHover={{ y: -6, scale: 1.006 }} transition={{ type: "spring", stiffness: 230, damping: 20 }}>
      <div className="preview-copy">
        <span className="preview-index" aria-hidden="true">{tone === "cyan" ? "01" : "02"}</span>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span className="preview-summary">{summary}</span>
        <span className="preview-link">Open live system <Arrow /></span>
      </div>
      <figure><img src={screenshot} alt={alt} /></figure>
    </motion.a>
  );
}

function Metrics() {
  return (
    <section className="metric-band page-frame" aria-label="Portfolio totals">
      <Metric icon="flag" value="2" label="flagships" />
      <Metric icon="flask" value="30" label="applied labs" />
      <Metric icon="shield" value="151" label="automated tests" />
    </section>
  );
}

function Metric({ icon, value, label }) {
  return (
    <div className="metric">
      <span className="metric-icon" aria-hidden="true"><UtilityIcon type={icon} /></span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function FlagshipWork() {
  return (
    <section id="work" className="work-section page-frame" aria-labelledby="work-title">
      <div className="section-intro">
        <p>Selected work / 2026</p>
        <h2 id="work-title">Two systems. Clear proof.</h2>
        <span>Functional demos first; presentation built around what can be verified.</span>
      </div>
      <div className="flagship-grid">
        {flagships.map((project) => <FlagshipCard key={project.number} project={project} />)}
      </div>
    </section>
  );
}

function FlagshipCard({ project }) {
  return (
    <article className={`flagship flagship-${project.tone}`}>
      <div className="project-rail"><strong>{project.number}</strong><span aria-hidden="true" /></div>
      <div className="project-body">
        <p className="project-subtitle">{project.subtitle}</p>
        <h3>{project.title}</h3>
        <div className="project-layout">
          <figure>
            <img src={project.screenshot} alt={project.alt} />
          </figure>
          <div className="project-evidence">
            <div>
              <h4>Problem</h4>
              <p>{project.problem}</p>
            </div>
            <div>
              <h4>Proof</h4>
              <ul>{project.proof.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <p className="project-stack">{project.stack}</p>
            <a className="outline-action" href={project.href}>{project.action} <Arrow /></a>
          </div>
        </div>
      </div>
    </article>
  );
}

function LabsRail() {
  return (
    <section className="labs-rail page-frame" aria-labelledby="labs-title">
      <span className="labs-icon" aria-hidden="true"><UtilityIcon type="flask" /></span>
      <div>
        <h2 id="labs-title">Applied Labs</h2>
        <p>30 hands-on projects connecting completed credentials to working, browser-local prototypes.</p>
      </div>
      <a className="outline-action" href={links.labs}>Explore Applied Labs <Arrow /></a>
    </section>
  );
}

function ProfileSummary() {
  return (
    <section id="about" className="profile-summary page-frame" aria-label="About and skills">
      <article>
        <UtilityIcon type="person" />
        <div>
          <h2>About</h2>
          <p>Deepan Karthick is a B.Sc. Computer Science with AI student at Rathinam Global University, focused on dependable software that turns operational data into clearer decisions.</p>
        </div>
      </article>
      <article>
        <UtilityIcon type="code" />
        <div>
          <h2>Working stack</h2>
          <p>React, JavaScript, Python, Supabase, Git, test-driven domain logic, browser-local workflows, PDF/report outputs, and technical documentation.</p>
        </div>
      </article>
      <article>
        <UtilityIcon type="document" />
        <div>
          <h2>Resume</h2>
          <p>Experience, coursework, selected projects, and application-ready proof.</p>
          <a className="text-link" href={links.atsResume}>Open ATS resume <Arrow /></a>
        </div>
      </article>
    </section>
  );
}

function Resources() {
  return (
    <section className="resources page-frame" aria-labelledby="resources-title">
      <div className="section-intro compact">
        <p>Review material</p>
        <h2 id="resources-title">Proof, profiles, and credentials.</h2>
      </div>
      <div className="resource-grid">
        {resourceLinks.map((item) => (
          <a key={item.label} href={item.href} className="resource-link">
            <span>{item.detail}</span>
            <strong>{item.label}</strong>
            <Arrow />
          </a>
        ))}
      </div>
    </section>
  );
}

function LinksPage() {
  const directory = [
    { label: "Applied Labs", detail: "30 working certificate prototypes", href: links.labs },
    { label: "Printing Press ERP", detail: "Live fictional business-workflow demo", href: links.erp },
    { label: "Timber CFT Pro + Billing", detail: "Measurement and billing demo", href: links.timber },
    ...resourceLinks,
    { label: "Career Kit repository", detail: "Project source and documentation", href: links.repository }
  ];
  return (
    <main className="links-main page-frame">
      <section className="links-hero">
        <p>One-tap review directory</p>
        <h1>Deepan Karthick</h1>
        <span>Software projects, applied labs, resumes, credentials, GitHub, and LinkedIn in one place.</span>
      </section>
      <section className="directory-grid" aria-label="Portfolio links">
        {directory.map((item) => (
          <a key={item.label} href={item.href}>
            <span>{item.detail}</span>
            <strong>{item.label}</strong>
            <Arrow />
          </a>
        ))}
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer page-frame">
      <span>Deepan Karthick / Software portfolio</span>
      <div><a href={links.github}>GitHub</a><a href={links.linkedin}>LinkedIn</a><a href="links.html">All links</a></div>
    </footer>
  );
}

function Arrow() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}

function ProjectIcon({ type }) {
  return type === "press" ? (
    <svg className="project-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="M14 23h36v28H14zM20 12h24v11H20zM22 34h20M22 41h14M9 28h5M50 28h5M20 51v5M44 51v5" /></svg>
  ) : (
    <svg className="project-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="m10 26 33-11 11 7-33 11zM10 26v12l11 7 33-11V22M21 33v12M33 29v12M45 25v12" /></svg>
  );
}

function UtilityIcon({ type }) {
  const paths = {
    flag: <><path d="M7 21V4M8 5h10l-2 4 2 4H8" /></>,
    flask: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8" /></>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6zM9 12l2 2 4-5" /></>,
    person: <><circle cx="12" cy="7" r="4" /><path d="M4 21c0-5 3-8 8-8s8 3 8 8" /></>,
    code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" /></>,
    document: <><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" /></>
  };
  return <svg className="utility-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
}

createRoot(document.getElementById("root")).render(<App />);
