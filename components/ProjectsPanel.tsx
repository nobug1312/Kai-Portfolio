"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useState } from "react";
import { projects } from "@/lib/content";

export function ProjectsPanel() {
  const [selected, setSelected] = useState(projects[0].name);
  const [query, setQuery] = useState("");
  const matches = projects.filter(project => `${project.name} ${project.org} ${project.tech.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const current = matches.find(project => project.name === selected) ?? matches[0];

  return (
    <div className="finder-panel">
      <aside className="finder-sidebar" aria-label="Project selection">
        <p className="finder-sidebar-label">Projects</p>
        <div className="finder-projects">
          {matches.map(project => (
            <button type="button" key={project.name} className="finder-project" aria-pressed={current?.name === project.name} onClick={() => setSelected(project.name)}>
              <Image src={`/desktop/icons/${project.icon}.png`} width={30} height={30} alt="" unoptimized />
              <span>{project.name}<small>{project.org}</small></span>
            </button>
          ))}
        </div>
        <p className="finder-item-count">{matches.length} {matches.length === 1 ? "project" : "projects"}</p>
      </aside>
      <div className="finder-content">
        <div className="finder-toolbar">
          <span>Professional Projects</span>
          <label className="finder-search"><Search size={15} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search" aria-label="Search projects" /></label>
        </div>
        {current ? (
          <article className="project-detail" key={current.name}>
            <header className="project-heading"><Image src={`/desktop/icons/${current.icon}.png`} width={48} height={48} alt="" unoptimized /><div><p>{current.org} / {current.kind}</p><h2>{current.name}</h2></div></header>
            <dl className="project-details">
              <div><dt>Product</dt><dd>{current.summary}</dd></div>
              <div><dt>Contribution</dt><dd>{current.contribution}</dd></div>
              <div className="project-outcome"><dt>Outcome</dt><dd>{current.outcome}</dd></div>
            </dl>
            <ul className="project-technologies" aria-label="Project technologies">{current.tech.map(technology => <li key={technology}>{technology}</li>)}</ul>
          </article>
        ) : <div className="finder-empty" role="status"><Search size={28} aria-hidden="true" /><p>No projects found</p><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
      </div>
    </div>
  );
}