import Image from "next/image";
import { Braces, Cloud, Database, GraduationCap, Mail, MapPin, Monitor, PanelsTopLeft, Server, Workflow, Wrench } from "lucide-react";
import { certificates, experience, projects, site, skills } from "@/lib/content";
import { SkillIcon } from "@/components/SkillIcon";

const groupIcons = [Braces, Server, PanelsTopLeft, Database, Cloud, Wrench, Monitor, Workflow];

export function ProfilePanel() {
  return (
    <article className="profile-panel panel-content">
      <header className="profile-heading">
        <Image src="/desktop/icons/profile.png" width={80} height={80} alt="" unoptimized />
        <div><h2>{site.name}</h2><p className="profile-role">{site.role}</p><p className="profile-specialty">{site.specialty}</p></div>
      </header>
      <p className="profile-tagline">{site.tagline}</p>
      <p className="profile-intro">{site.intro}</p>
      <dl className="profile-facts">
        <div><dt>Location</dt><dd><MapPin size={15} aria-hidden="true" />{site.location}</dd></div>
        <div><dt>Email</dt><dd><a href={`mailto:${site.email}`}><Mail size={15} aria-hidden="true" /><span>{site.email}</span></a></dd></div>
        <div><dt>Focus</dt><dd>System design, engineering quality and technical leadership</dd></div>
      </dl>
      <ul className="profile-highlights" aria-label="Career highlights">
        <li><strong>40%</strong><span>Less deployment time</span></li>
        <li><strong>3D</strong><span>Computational geometry</span></li>
        <li><strong>{String(projects.length).padStart(2, "0")}</strong><span>Professional projects</span></li>
      </ul>
      <footer className="profile-links">
        <a href={site.github} target="_blank" rel="noopener noreferrer"><Image src="/icons/devicon/github.svg" width={17} height={17} alt="" className="social-icon" />GitHub<span className="sr-only"> (opens in a new tab)</span></a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer"><Image src="/icons/devicon/linkedin.svg" width={17} height={17} alt="" className="social-icon" />LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
        <a href="/desktop/attribution.json" target="_blank" rel="noopener noreferrer">Asset credits<span className="sr-only"> (opens in a new tab)</span></a>
        <span className="profile-copyright">{site.name}</span>
      </footer>
    </article>
  );
}

export function SkillsPanel() {
  return (
    <section className="panel-content technologies-panel" aria-labelledby="technologies-heading">
      <header className="panel-heading"><h2 id="technologies-heading">Core Technologies</h2><span>{skills.length} categories</span></header>
      <div className="technology-groups">
        {skills.map((group, index) => {
          const Icon = groupIcons[index];
          return (
            <section key={group.title} className="technology-group">
              <h3><Icon size={17} strokeWidth={1.6} aria-hidden="true" />{group.title}</h3>
              <ul>{group.items.map(name => <li key={name} className="skill-label"><SkillIcon name={name} /><span>{name}</span></li>)}</ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}

export function ExperiencePanel() {
  return (
    <section className="panel-content experience-panel" aria-labelledby="experience-heading">
      <header className="panel-heading"><h2 id="experience-heading">Work &amp; Education</h2></header>
      <ol className="career-timeline">
        {experience.map(role => (
          <li key={role.title}>
            <p className="career-date">{role.when}</p>
            <h3>{role.org}</h3>
            <p className="career-role">{role.title}</p>
            {role.team && <p className="career-team">{role.team}</p>}
            <p className="career-summary">{role.summary}</p>
            {role.points && <ul>{role.points.map(point => <li key={point}>{point}</li>)}</ul>}
          </li>
        ))}
      </ol>
      <section className="certificates" aria-labelledby="certificates-heading">
        <h3 id="certificates-heading"><GraduationCap size={18} aria-hidden="true" />Certificates</h3>
        <ul>{certificates.map(certificate => <li key={certificate.name}><span>{certificate.name}</span><time>{certificate.date}</time></li>)}</ul>
      </section>
    </section>
  );
}