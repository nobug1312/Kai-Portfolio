import { Desktop } from "@/components/Desktop";
import { ExperiencePanel, ProfilePanel, SkillsPanel } from "@/components/DesktopPanels";
import { ProfileTerminal } from "@/components/ProfileTerminal";
import { ProjectsPanel } from "@/components/ProjectsPanel";
import { projects, site } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Desktop panels={{
        profile: <ProfilePanel />,
        terminal: <ProfileTerminal />,
        projects: <ProjectsPanel />,
        stack: <SkillsPanel />,
        experience: <ExperiencePanel />,
      }} />
      <noscript>
        <style>{".mac-desktop { display: none; }"}</style>
        <main className="desktop-fallback">
          <h1 className="sr-only">{site.name} - {site.role}</h1>
          <ProfilePanel />
          <section className="panel-content" aria-labelledby="fallback-projects">
            <header className="panel-heading"><h2 id="fallback-projects">Projects</h2></header>
            {projects.map(project => (
              <article key={project.name} className="fallback-project">
                <p>{project.org} / {project.kind}</p>
                <h3>{project.name}</h3>
                <dl className="project-details">
                  <div><dt>Product</dt><dd>{project.summary}</dd></div>
                  <div><dt>Contribution</dt><dd>{project.contribution}</dd></div>
                  <div><dt>Outcome</dt><dd>{project.outcome}</dd></div>
                </dl>
              </article>
            ))}
          </section>
          <SkillsPanel />
          <ExperiencePanel />
        </main>
      </noscript>
    </>
  );
}