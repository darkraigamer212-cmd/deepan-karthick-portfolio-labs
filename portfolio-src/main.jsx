import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import gsap from "gsap";
import { BookOpenIcon } from "@phosphor-icons/react/dist/csr/BookOpen";
import { AtomIcon } from "@phosphor-icons/react/dist/csr/Atom";
import { CloudIcon } from "@phosphor-icons/react/dist/csr/Cloud";
import { CodeIcon } from "@phosphor-icons/react/dist/csr/Code";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { FlaskIcon } from "@phosphor-icons/react/dist/csr/Flask";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { Arrow, SiteProvider, SiteHeader, SiteFooter, siteLinks, useSiteMotion } from "../shared/ui/SiteChrome.jsx";
import { ProjectSearch } from "../shared/ui/ProjectSearch.jsx";
import "./styles.css";

const linksPage = document.body.dataset.page === "links";
document.title = linksPage ? "Deepan Karthick | Portfolio Links" : "Deepan Karthick | Software Portfolio";

const projects = [
  { id:"timber", number:"01", title:"Timber CFT Pro + Billing", caption:"Measure, price, and invoice timber.", image:"/assets/screenshots/timber-calculator.jpg", alt:"Actual Timber CFT Pro calculator with a synthetic bill and invoice totals", href:siteLinks.timber, action:"Open Timber", stack:"React · tested calculations · local history", problem:"Manual measurements and bills make unit conversion, tax, payment, and record keeping harder than necessary.", approach:"One workflow for CFT and M3 calculations, pricing, GST, payments, saved bills, and printable statements.", limit:"Browser-local prototype. The sample is synthetic, and saved bills remain in the browser you use." },
  { id:"erp", number:"02", title:"Printing Press ERP", caption:"From production orders to dispatch.", image:"/assets/screenshots/printing-erp-dashboard.jpg", alt:"Actual Printing Press ERP owner dashboard with synthetic production orders", href:siteLinks.erp, action:"Open ERP", stack:"React · operational workflows · demo store", problem:"Print jobs become difficult to coordinate when priorities, production, stock, and invoices live in separate notes.", approach:"Connected views for orders, production, inventory, invoices, reports, and staff, demonstrated with fictional data.", limit:"Public synthetic demo. Browser-local changes do not affect a real business or its private backend." }
];

const categories = [
  ["ai-ml","AI & ML",10,AtomIcon], ["cloud","Cloud & Networking",5,CloudIcon], ["software-data","Programming & Data",6,CodeIcon],
  ["business-finance","Business & Finance",2,ChartBarIcon], ["cybersecurity","Cybersecurity",7,ShieldCheckIcon]
];
const resources = [
  ["Project guide","Methods, setup, and troubleshooting · PDF",siteLinks.guide], ["ATS resume","Application-ready experience and selected work",siteLinks.atsResume],
  ["Startup resume","A project-focused introduction",siteLinks.startupResume], ["Certificates","Completed-credential archive",siteLinks.certificates],
  ["Source repository","Public source and documentation",siteLinks.repository], ["LinkedIn","Professional profile",siteLinks.linkedin]
];

function Reveal({ children, className="", id }) {
  const { motionEnabled } = useSiteMotion();
  return <motion.section className={className} id={id} initial={motionEnabled ? {opacity:.55,y:20}:false} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.55}}>{children}</motion.section>;
}

function Hero() {
  const area=useRef(null), art=useRef(null); const {motionEnabled}=useSiteMotion();
  useEffect(()=>{ if(!motionEnabled||!matchMedia("(pointer:fine)").matches) return;
    const hero=area.current, artwork=art.current;if(!hero||!artwork)return;
    const x=gsap.quickTo(artwork,"x",{duration:.8}),y=gsap.quickTo(artwork,"y",{duration:.8});
    const move=e=>{const r=hero.getBoundingClientRect();x(((e.clientX-r.left)/r.width-.5)*18);y(((e.clientY-r.top)/r.height-.5)*14)};const reset=()=>{x(0);y(0)};
    hero.addEventListener("pointermove",move,{passive:true});hero.addEventListener("pointerleave",reset);
    return()=>{hero.removeEventListener("pointermove",move);hero.removeEventListener("pointerleave",reset);gsap.killTweensOf(artwork);gsap.set(artwork,{clearProps:"transform"})};
  },[motionEnabled]);
  return <section className="studio-hero studio-width" ref={area} aria-labelledby="hero-title"><div className="hero-art-stage" aria-hidden="true"><img ref={art} src="/assets/art/aurora-circuit-hero.png" alt="" fetchPriority="high" /></div><div className="hero-copy">
    <p className="overline">Computer Science + AI</p><h1 id="hero-title">Thoughtfully built.<br/>Ready to explore.</h1><p className="hero-lead">I’m Deepan Karthick. I build practical software and turn what I learn into tools you can try.</p>
    <div className="hero-actions"><a className="studio-button primary" href="#work">Explore my work <Arrow/></a><a className="studio-button" href={siteLinks.guide}><BookOpenIcon size={20}/>Read the guide</a></div><ProjectSearch/>
    <div className="hero-facts"><span><SquaresFourIcon size={23}/><strong>2</strong> flagships</span><span><FlaskIcon size={23}/><strong>30</strong> applied labs</span></div>
  </div></section>;
}

function Work(){return <Reveal className="studio-work studio-width" id="work"><header className="section-label"><p className="overline">Selected work</p><span>Real tools · open demos</span></header><h2 className="sr-only">Flagship projects</h2><div className="project-list">{projects.map(p=><article className={`project project-${p.id}`} key={p.id}>
  <div className="project-copy"><div className="project-meta"><span>{p.number}</span><small>Synthetic demo</small></div><h3>{p.id === "timber" ? <>Timber CFT<br/>Pro + Billing</> : <>Printing Press<br/>ERP</>}</h3><p>{p.caption}</p><a className="studio-button coral" href={p.href}>{p.action}<Arrow/></a><em>{p.stack}</em></div>
  <a className="project-shot" href={p.href} aria-label={`Explore ${p.title}`}><img src={p.image} alt={p.alt} width="1425" height="843" loading="lazy"/></a>
  <details><summary>Problem, approach & demo limits</summary><div><section><h4>The problem</h4><p>{p.problem}</p></section><section><h4>The approach</h4><p>{p.approach}</p></section><section><h4>Know the limits</h4><p>{p.limit}</p></section></div></details>
  </article>)}</div></Reveal>}

function Labs(){return <Reveal className="lab-showcase studio-width"><header><h2>30 experiments. Real things to try.</h2><a href={siteLinks.labs}>Explore all labs <Arrow/></a></header><div>{categories.map(([key,title,count,Icon])=><a key={key} href={siteLinks.labs} aria-label={`Browse all labs, including ${count} ${title} projects`}><Icon size={27} weight="light"/><span>{title}<small>{count} projects · browse all labs</small></span></a>)}</div></Reveal>}
function Guide(){return <Reveal className="guide-showcase studio-width"><div className="guide-icon"><BookOpenIcon size={70} weight="light"/></div><div><p className="overline">The project handbook</p><h2>Behind every build.</h2><p>How it works. Why it exists. How to build it.</p><a className="studio-button" href={siteLinks.guide}>Read the project guide <Arrow size={17}/></a></div></Reveal>}
function About(){return <Reveal className="about studio-width" id="about"><div><p className="overline">A little about me</p><h2>Curiosity, turned<br/>into working software.</h2></div><div><p>I’m a B.Sc. Computer Science with AI student at Rathinam Global University, interested in useful software, dependable workflows, and thoughtful product design.</p><strong>Available for software internships and startup projects.</strong><br/><a href={siteLinks.atsResume}>View my resume <Arrow size={17}/></a></div></Reveal>}
function Resources(){return <Reveal className="resources studio-width"><h2>Explore the details.</h2><div>{resources.map(([title,detail,href])=><a key={title} href={href}><span><strong>{title}</strong><small>{detail}</small></span><Arrow size={18}/></a>)}</div></Reveal>}
function Home(){return <main id="main-content"><Hero/><Work/><Labs/><Guide/><About/><Resources/></main>}
function Links(){const all=[...projects.map(p=>[p.title,p.caption,p.href]),["Applied Labs","Explore all 30 projects",siteLinks.labs],...resources,["GitHub profile","Repositories and code",siteLinks.github]];return <main id="main-content" className="directory studio-width"><p className="overline">Everything in one place</p><h1>Deepan Karthick</h1><p>Projects, guides, credentials, and ways to connect.</p><ProjectSearch/><section aria-label="Portfolio links">{all.map(([t,d,h])=><a href={h} key={t}><strong>{t}</strong><span>{d}</span><Arrow/></a>)}</section></main>}
function App(){return <SiteProvider><SiteHeader active={linksPage?"links":"work"}/>{linksPage?<Links/>:<Home/>}<SiteFooter/></SiteProvider>}
createRoot(document.getElementById("root")).render(<App/>);
