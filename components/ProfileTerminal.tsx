"use client";

import { ArrowRight, CircleHelp, Terminal } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { about, experience, projects, site, skills } from "@/lib/content";

const profile = `${site.name}\n${site.role}\n${site.specialty}\n\n${site.location}`;
const shortcuts = ["whoami", "skills", "projects", "contact"];

function resolveCommand(command: string): string {
  switch (command.toLowerCase()) {
    case "whoami":
      return profile;
    case "about":
      return about;
    case "skills":
      return skills.map(group => `${group.title}\n  ${group.items.join(" / ")}`).join("\n\n");
    case "work":
    case "projects":
      return projects.map((project, index) => `${String(index + 1).padStart(2, "0")}  ${project.name}\n    ${project.org} | ${project.kind}`).join("\n\n");
    case "experience":
      return experience.map(role => `${role.org}\n${role.title} | ${role.when}`).join("\n\n");
    case "contact":
      return `${site.email}\n${site.github}\n${site.linkedin}`;
    case "help":
      return "whoami      Profile\nabout       Introduction\nskills      Core technologies\nprojects    Professional projects\nexperience  Work & education\ncontact     Email & social links\nclear       Clear output";
    default:
      return `Command not found: ${command}\nAvailable: whoami, about, skills, projects, experience, contact, help, clear`;
  }
}

export function ProfileTerminal() {
  const [input, setInput] = useState("");
  const [lastCommand, setLastCommand] = useState("whoami");
  const [output, setOutput] = useState(profile);
  const resultRef = useRef<HTMLDivElement>(null);

  function runCommand(command: string) {
    const trimmed = command.trim().slice(0, 64);
    if (!trimmed) return;
    if (resultRef.current) resultRef.current.scrollTop = 0;
    setLastCommand(trimmed);
    setOutput(trimmed.toLowerCase() === "clear" ? "" : resolveCommand(trimmed));
    setInput("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(input);
  }

  return (
    <section className="profile-terminal" aria-label="Interactive profile terminal">
      <div className="terminal-titlebar">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal size={17} aria-hidden="true" className="text-forest" />
          <span>~/kai/profile.sh</span>
        </div>
        <div className="terminal-window-controls" aria-hidden="true">
          <span className="terminal-window-dot" />
          <span className="terminal-window-dot" />
          <span className="terminal-window-dot" />
        </div>
      </div>
      <div className="terminal-shortcuts" aria-label="Profile commands">
        {shortcuts.map(command => (
          <button key={command} type="button" onClick={() => runCommand(command)} className="terminal-shortcut" aria-pressed={lastCommand.toLowerCase() === command}>
            {command}
          </button>
        ))}
        <button type="button" className="terminal-shortcut terminal-help ml-auto" onClick={() => runCommand("help")} aria-label="Show terminal commands" title="Show terminal commands" aria-pressed={lastCommand.toLowerCase() === "help"}><CircleHelp size={16} aria-hidden="true" /></button>
      </div>
      <div ref={resultRef} className="terminal-result" role="status" aria-live="polite" aria-atomic="true" tabIndex={0} aria-label="Command output">
        <p className="terminal-command-line"><span className="text-amber" aria-hidden="true">❯ </span>{lastCommand}</p>
        <pre className="terminal-output">{output}</pre>
      </div>
      <form onSubmit={submit} className="terminal-form">
        <span aria-hidden="true" className="terminal-prompt">kai<span className="text-sand">:~</span> $</span>
        <label htmlFor="profile-command" className="sr-only">Terminal command</label>
        <div className="terminal-input-wrap">
          <input id="profile-command" value={input} onChange={event => setInput(event.target.value)} maxLength={64} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="help" className="terminal-input" />
          {!input && <span className="terminal-idle-caret" aria-hidden="true" />}
        </div>
        <button type="submit" disabled={!input.trim()} className="terminal-submit" aria-label="Run command" title="Run command"><ArrowRight size={18} aria-hidden="true" /></button>
      </form>
    </section>
  );
}