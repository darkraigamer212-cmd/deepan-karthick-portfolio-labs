import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import manifest from "../../docs/project-control/project-manifest.json";
import { createProjectSearchIndex, searchProjects, MAX_PROJECT_QUERY_LENGTH } from "../project-search.js";

const projectIndex = createProjectSearchIndex(manifest);

export function ProjectSearch({ shortcut = true, label = "Find a project, skill, or problem", category }) {
  const id = useId();
  const input = useRef(null);
  const list = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const results = useMemo(() => searchProjects(projectIndex, query, { limit: 6, category }), [query, category]);
  const listId = `${id}-results`;

  useEffect(() => {
    if (!open || active < 0) return;
    const container = list.current;
    const option = container?.children[active];
    if (!container || !option) return;
    // Keep keyboard selection visible without scrolling the page or its input.
    const bounds = container.getBoundingClientRect();
    const selected = option.getBoundingClientRect();
    if (selected.top < bounds.top) container.scrollTop -= bounds.top - selected.top;
    else if (selected.bottom > bounds.bottom) container.scrollTop += selected.bottom - bounds.bottom;
  }, [active, open]);

  useEffect(() => {
    if (!shortcut) return undefined;
    const focusSearch = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, [shortcut]);

  function handleKey(event) {
    if (event.key === "Escape") { setOpen(false); setActive(-1); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => !results.length ? -1 : current < 0
        ? (direction > 0 ? 0 : results.length - 1)
        : (current + direction + results.length) % results.length);
    } else if (event.key === "Enter" && open && active >= 0 && results[active]) {
      event.preventDefault();
      window.location.assign(results[active].route);
    }
  }

  return (
    <div className="project-search" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); }
    }}>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <div className={`search-field ${open ? "is-open" : ""}`}>
        <MagnifyingGlassIcon size={22} aria-hidden="true" />
        <input id={id} ref={input} type="search" role="combobox" autoComplete="off" spellCheck="false"
          placeholder={`${label}…`} maxLength={MAX_PROJECT_QUERY_LENGTH} value={query}
          aria-autocomplete="list" aria-expanded={open} aria-controls={listId}
          aria-activedescendant={open && active >= 0 && results[active] ? `${id}-${results[active].id}` : undefined}
          onFocus={() => setOpen(true)} onKeyDown={handleKey}
          onChange={(event) => { setQuery(event.target.value); setActive(-1); setOpen(true); }} />
        {query ? <button className="search-clear" type="button" aria-label="Clear project search"
          onClick={() => { setQuery(""); setActive(-1); input.current?.focus(); }}><XIcon size={17} aria-hidden="true" /></button>
          : shortcut ? <kbd aria-hidden="true">Ctrl K</kbd> : null}
      </div>
      <div className="search-popup" hidden={!open}>
        <p className="search-heading">{query.trim() ? "Matching projects" : "Start exploring"}</p>
        <ul ref={list} role="listbox" id={listId} aria-label="Project suggestions">
          {results.map((project, index) => (
            <li id={`${id}-${project.id}`} key={project.id} role="option" aria-selected={index === active}
              onPointerDown={(event) => event.preventDefault()} onPointerMove={() => setActive(index)}
              onClick={() => window.location.assign(project.route)}>
              <span><strong>{project.title}</strong><small>{project.categoryLabel}</small></span>
              <ArrowUpRightIcon size={19} aria-hidden="true" />
            </li>
          ))}
        </ul>
        {!results.length ? <p className="search-empty">No matches. Try “timber”, “network”, or “Python”.</p> : null}
        <p className="search-hint">Arrow keys to browse · Enter to open · Esc to close</p>
      </div>
      <span className="sr-only" role="status">{open ? `${results.length} project suggestions available.` : ""}</span>
    </div>
  );
}
