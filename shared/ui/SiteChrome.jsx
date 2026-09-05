import React, { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/inter/wght.css";
import "./system.css";

export const siteLinks = {
  home: "/",
  labs: "/labs/",
  timber: "/timber-demo/",
  erp: "https://lakshmipriya-erp-demo.industrious-keyboard.workers.dev/owner",
  guide: "/docs/generated/portfolio_labs_complete_manual.pdf",
  atsResume: "/docs/generated/karthik_ats_resume.pdf",
  startupResume: "/docs/generated/karthik_startup_resume.pdf",
  certificates: "/assets/certificates/Deepan_K_Certificates_Combined.pdf",
  github: "https://github.com/darkraigamer212-cmd",
  repository: "https://github.com/darkraigamer212-cmd/deepan-karthick-portfolio-labs",
  linkedin: "https://www.linkedin.com/in/deepan-karthick-166735374/",
};

const MotionPreference = createContext({ motionEnabled: false });
export function useSiteMotion() { return useContext(MotionPreference); }

export function SiteProvider({ children }) {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem("portfolio.motion-paused.v1") === "true"; }
    catch { return false; }
  });
  const motionEnabled = !reduced && !paused;
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    try { localStorage.setItem("portfolio.motion-paused.v1", String(paused)); }
    catch { /* Motion controls still work when storage is unavailable. */ }
  }, [paused]);

  return (
    <MotionPreference.Provider value={{ motionEnabled, paused, setPaused, reduced }}>
      <MotionConfig reducedMotion={motionEnabled ? "user" : "always"}>
        <div className="cosmic-app" data-motion={motionEnabled ? "on" : "off"}>
          <a className="skip-link" href="#main-content">Skip to content</a>
          {children}
        </div>
      </MotionConfig>
    </MotionPreference.Provider>
  );
}

export function MotionToggle() {
  const { paused, setPaused, reduced } = useSiteMotion();
  const Icon = paused || reduced ? PlayIcon : PauseIcon;
  return (
    <button className="motion-toggle" type="button" onClick={() => setPaused(!paused)}
      disabled={Boolean(reduced)} aria-pressed={paused || Boolean(reduced)}
      aria-label={reduced ? "Motion reduced by system preference" : paused ? "Enable decorative motion" : "Pause decorative motion"}
      title={reduced ? "Following your system’s reduced-motion setting" : paused ? "Enable motion" : "Pause motion"}>
      <Icon size={15} aria-hidden="true" />
      <span>{reduced ? "Reduced motion" : paused ? "Motion off" : "Motion on"}</span>
    </button>
  );
}

export function SiteHeader({ active = "work" }) {
  return (
    <header className="cosmic-header">
      <a className="cosmic-wordmark" href={siteLinks.home}><span className="brand-dot" aria-hidden="true" />Deepan Karthick</a>
      <nav aria-label="Primary navigation">
        <a href="/#work" aria-current={active === "work" ? "page" : undefined}>Work</a>
        <a href={siteLinks.labs} aria-current={active === "labs" ? "page" : undefined}>Applied Labs</a>
        <a href={siteLinks.guide}>Guide <span className="sr-only">(PDF)</span></a>
        <a href={siteLinks.atsResume}>Resume <ArrowUpRightIcon size={13} aria-hidden="true" /></a>
      </nav>
      <MotionToggle />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="cosmic-footer">
      <div><a className="cosmic-wordmark" href={siteLinks.home}>Deepan Karthick</a><p>Practical software. Thoughtfully built.</p></div>
      <nav aria-label="Footer navigation">
        <a href={siteLinks.github}><GithubLogoIcon size={19} aria-hidden="true" /> GitHub</a>
        <a href={siteLinks.linkedin}><LinkedinLogoIcon size={19} aria-hidden="true" /> LinkedIn</a>
        <a href="/links.html">All links <ArrowUpRightIcon size={16} aria-hidden="true" /></a>
      </nav>
    </footer>
  );
}

export function Arrow({ size = 20 }) { return <ArrowUpRightIcon size={size} aria-hidden="true" />; }
