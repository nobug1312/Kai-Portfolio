"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import { site } from "@/lib/content";
import { ArrowRight } from "lucide-react";

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [introStarted, setIntroStarted] = useState(false);
  const [nameTyped, setNameTyped] = useState("");
  const [roleTyped, setRoleTyped] = useState("");
  const [leaving, setLeaving] = useState(false);
  const screenRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const complete = useEffectEvent(onComplete);

  useEffect(() => {
    const audio = new Audio("/desktop/intro_final.mp3");
    audio.volume = 0.85;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!introStarted) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (leaving) {
      if (motion.matches) {
        complete();
        return;
      }
      const screen = screenRef.current;
      if (!screen?.animate) {
        complete();
        return;
      }
      const animation = screen.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 400, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards",
      });
      animation.finished.then(() => complete()).catch(() => {});
      return () => {
        animation.cancel();
      };
    }

    let count = 0;
    let timer: number;
    const nameCharacters = Array.from(site.name);
    const roleCharacters = Array.from(site.role);
    function typeName() {
      count++;
      setNameTyped(nameCharacters.slice(0, count).join(""));
      if (count < nameCharacters.length) {
        timer = window.setTimeout(typeName, 100);
      } else {
        count = 0;
        timer = window.setTimeout(typeRole, 250);
      }
    }
    function typeRole() {
      count++;
      setRoleTyped(roleCharacters.slice(0, count).join(""));
      if (count < roleCharacters.length) {
        timer = window.setTimeout(typeRole, 65);
      } else {
        timer = window.setTimeout(() => setLeaving(true), 1000);
      }
    }
    timer = window.setTimeout(typeName, 120);
    return () => window.clearTimeout(timer);
  }, [introStarted, leaving]);

  function login() {
    const audio = audioRef.current;
    if (audio) void audio.play().catch(() => {});
    setIntroStarted(true);
  }

  return (
    <section ref={screenRef} className="mac-welcome" role="dialog" aria-modal="true" aria-label={`Welcome to ${site.name}`} onKeyDown={event => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLeaving(true);
      }
    }}>
      {!introStarted ? <div className="welcome-login">
        <Image src="/desktop/avatar-login.gif" width={88} height={88} alt="" unoptimized priority />
        <h2>{site.name}</h2>
        <button type="button" className="welcome-login-button" onClick={login} aria-label="Log in">
          <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div> : <div className="welcome-content">
        <h2 className="welcome-name">{nameTyped}<span className="welcome-caret" /></h2>
        <p className="welcome-quote">{roleTyped}{roleTyped.length < site.role.length && <span className="welcome-quote-caret" />}</p>
      </div>}
    </section>
  );
}