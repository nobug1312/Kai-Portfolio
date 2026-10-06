import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Braces, BriefcaseBusiness, Cloud, Database, FolderCode, GraduationCap, Mail, MapPin, Monitor, PanelsTopLeft, Server, Terminal, Workflow, Wrench, type LucideIcon } from "lucide-react";
import { ProfileTerminal } from "@/components/ProfileTerminal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SkillIcon } from "@/components/SkillIcon";
import { certificates, experience, nav, projects, site, skills } from "@/lib/content";

const skillIcons = [Braces, Server, PanelsTopLeft, Database, Cloud, Wrench, Monitor, Workflow];

function External({ href, icon, children }: { href: string; icon: "github" | "linkedin"; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="contact-link text-link">
      <Image src={`/icons/devicon/${icon}.svg`} width={16} height={16} alt="" aria-hidden="true" unoptimized className="social-icon" />
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Section({ id, icon: Icon, title, children }: { id: string; icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="section-layout reveal">
      <div className="section-heading reveal-item">
        <span className="section-marker" aria-hidden="true"><Icon size={20} strokeWidth={1.6} /></span>
        <h2 id={`${id}-title`}>{title}</h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <nav aria-label="Primary" className="page-width flex h-20 items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 font-semibold" aria-label="Kai Le, back to top">
            <Terminal className="text-forest" size={21} aria-hidden="true" />
            <span className="brand-name">kai<span className="hidden sm:inline"><span className="text-sand"> / </span><span className="text-mute">portfolio</span></span></span>
          </a>
          <ul className="header-links flex items-center gap-4 text-xs text-mute sm:gap-6">
            {nav.map((entry) => (
              <li key={entry.id} className={entry.mobile ? "" : "hidden md:block"}>
                <a href={`#${entry.id}`} className="nav-link inline-flex min-h-11 items-center">{entry.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" className="page-width">
        <section id="top" aria-labelledby="hero-title" className="hero fade-in">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="hero-command"><span aria-hidden="true" className="text-forest">$ </span>whoami</p>
            <h1 id="hero-title" className="hero-name">Kai<span className="text-forest"> Le.</span></h1>
            <p className="hero-role">{site.role}<span className="hero-specialty">{site.specialty}</span></p>
            <p className="hero-summary">{site.tagline}</p>
            <p className="hero-intro">{site.intro}</p>
            <div className="hero-actions">
              <a href="#projects" className="primary-link">View projects<ArrowDown size={17} aria-hidden="true" /></a>
              <div id="contact" role="group" aria-label="Contact" className="contact-links">
                <a href={`mailto:${site.email}`} aria-label={`Email ${site.name}`} title={site.email} className="contact-link text-link"><Mail size={16} aria-hidden="true" className="text-forest" />Email</a>
                <External href={site.github} icon="github">GitHub</External>
                <External href={site.linkedin} icon="linkedin">LinkedIn</External>
              </div>
            </div>
          </div>
          <div className="hero-terminal">
            <p className="terminal-eyebrow">Profile terminal</p>
            <ProfileTerminal />
            <p className="terminal-location"><MapPin size={14} aria-hidden="true" />{site.location}</p>
          </div>
          <ul className="hero-proof" aria-label="Career highlights">
            <li><strong className="hero-proof-value text-forest">40%</strong><div><p>Less deployment time</p><span>Workflow redesign with the team lead</span></div></li>
            <li><strong className="hero-proof-value">3D</strong><div><p>Computational geometry</p><span>From structural models to fabrication</span></div></li>
            <li><strong className="hero-proof-value text-amber">{String(projects.length).padStart(2, "0")}</strong><div><p>Professional projects</p><span>Web, desktop and production systems</span></div></li>
          </ul>
        </section>

        <Section id="skills" icon={Braces} title="Core Technologies">
          <div className="skills-grid">
            {skills.map((group, index) => {
              const Icon = skillIcons[index];
              return (
                <div key={group.title} className="skill-group reveal-item">
                  <h3 className="mb-5 flex items-center gap-3 font-medium"><Icon aria-hidden="true" size={21} strokeWidth={1.6} className="text-forest" />{group.title}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => <li key={item} className="skill-label"><SkillIcon name={item} /><span>{item}</span></li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </Section>

        <Section id="projects" icon={FolderCode} title="Projects">
          <ol className="project-list">
            {projects.map((project, index) => (
              <li key={project.name} className="project-row reveal-item">
                <span className="project-number" aria-hidden="true">0{index + 1}</span>
                <div className="min-w-0">
                  <p className="eyebrow text-mute">{project.org}<span aria-hidden="true" className="text-sand"> / </span>{project.kind}</p>
                  <h3 className="mt-3 text-2xl font-medium">{project.name}</h3>
                  <dl className="project-details">
                    <div><dt>Product</dt><dd>{project.summary}</dd></div>
                    <div><dt>Contribution</dt><dd>{project.contribution}</dd></div>
                    <div className="project-outcome"><dt>Outcome</dt><dd>{project.outcome}</dd></div>
                  </dl>
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-forest">{project.tech.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="experience" icon={BriefcaseBusiness} title="Work & education">
          <ol className="timeline">
            {experience.map((role) => (
              <li key={role.title} className="timeline-item reveal-item">
                <p className="eyebrow text-mute">{role.when}</p>
                <h3 className="mt-3 text-2xl font-medium">{role.org}</h3>
                <p className="mt-1 text-sm font-medium text-forest">{role.title}</p>
                {role.team && <p className="mt-2 text-xs leading-relaxed text-mute">{role.team}</p>}
                <p className="mt-4 leading-relaxed text-mute">{role.summary}</p>
                {role.points && <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mute">{role.points.map((point) => <li key={point} className="flex gap-3"><span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-forest" />{point}</li>)}</ul>}
              </li>
            ))}
          </ol>
          <div className="reveal-item mt-10 border-t border-line pt-6">
            <h3 className="flex items-center gap-2 text-sm font-medium"><GraduationCap aria-hidden="true" size={18} className="text-forest" />Certificates</h3>
            <ul className="mt-4 space-y-3 text-sm text-mute">{certificates.map((certificate) => <li key={certificate.name} className="flex flex-wrap justify-between gap-2"><span>{certificate.name}</span><span>{certificate.date}</span></li>)}</ul>
          </div>
        </Section>

      </main>

      <footer className="page-width reveal">
        <div className="reveal-item flex items-center justify-between gap-4 border-t border-line py-4 text-xs text-mute">
          <p className="font-mono">© {new Date().getFullYear()} {site.name}</p>
          <a href="#top" className="text-link grid size-11 place-items-center" aria-label="Back to top" title="Back to top"><ArrowUp aria-hidden="true" size={18} /></a>
        </div>
      </footer>
      <ScrollReveal />
    </>
  );
}