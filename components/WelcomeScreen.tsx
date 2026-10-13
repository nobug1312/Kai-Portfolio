"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { site } from "@/lib/content";

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [quoteTyped, setQuoteTyped] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const screenRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const complete = useEffectEvent(onComplete);

  useEffect(() => {
    const audio = new Audio("/desktop/intro_final.mp3");
    audio.volume = 0.85;
    audioRef.current = audio;
    let active = true;
    const retryPlayback = () => {
      window.removeEventListener("pointerdown", retryPlayback);
      window.removeEventListener("keydown", retryPlayback);
      if (active) void audio.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    };
    audio.play().then(() => setAudioBlocked(false)).catch(() => {
      if (!active) return;
      setAudioBlocked(true);
      window.addEventListener("pointerdown", retryPlayback, { once: true });
      window.addEventListener("keydown", retryPlayback, { once: true });
    });

    return () => {
      active = false;
      window.removeEventListener("pointerdown", retryPlayback);
      window.removeEventListener("keydown", retryPlayback);
      audio.pause();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) {
      complete();
      return;
    }

    function finishMotion() { if (motion.matches) complete(); }
    motion.addEventListener("change", finishMotion);
    if (leaving) {
      const screen = screenRef.current;
      if (!screen?.animate) {
        complete();
        motion.removeEventListener("change", finishMotion);
        return;
      }
      const animation = screen.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 400, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards",
      });
      animation.finished.then(() => complete()).catch(() => {});
      return () => {
        animation.cancel();
        motion.removeEventListener("change", finishMotion);
      };
    }

    const characters = Array.from(site.name);
    const quoteFull = site.role;
    const quoteChars = Array.from(quoteFull);
    let count = 0;
    let timer: number;

    function typeName() {
      count++;
      if (nameRef.current) nameRef.current.textContent = characters.slice(0, count).join("");
      if (count < characters.length) {
        timer = window.setTimeout(typeName, 120);
      } else {
        // Sau khi tên xong, bắt đầu gõ quote
        timer = window.setTimeout(startQuote, 400);
      }
    }

    let qCount = 0;
    function startQuote() {
      typeQuote();
    }

    function typeQuote() {
      qCount++;
      setQuoteTyped(quoteChars.slice(0, qCount).join(""));
      if (qCount < quoteChars.length) {
        timer = window.setTimeout(typeQuote, 70);
      } else {
        // Render xong chữ -> hiện spinner loading trong 2 giây rồi vào desktop
        timer = window.setTimeout(() => {
          setShowSpinner(true);
          timer = window.setTimeout(() => {
            setLeaving(true);
          }, 2000);
        }, 500);
      }
    }

    timer = window.setTimeout(typeName, 400);

    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener("change", finishMotion);
    };
  }, [leaving]);

  return (
    <section ref={screenRef} className="mac-welcome" role="dialog" aria-modal="true" aria-label={`Welcome to ${site.name}`} onKeyDown={event => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLeaving(true);
      }
    }}>
      <div className="welcome-content">
        <h2 className="sr-only">{site.name}</h2>
        <span className="welcome-name" aria-hidden="true">
          <span className="welcome-name-measure">{site.name}</span>
          <span className="welcome-typed"><span ref={nameRef} /><span className="welcome-caret" /></span>
        </span>
        <div className="welcome-quote" aria-hidden="true">
          {quoteTyped}
          {quoteTyped.length > 0 && !showSpinner && <span className="welcome-quote-caret" />}
        </div>
        {audioBlocked && <button type="button" className="welcome-sound-button" onClick={() => {
          const audio = audioRef.current;
          if (audio) void audio.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
        }}>Enable sound</button>}
        {showSpinner && (
          <div className="welcome-apple-spinner" aria-label="Loading..." role="status">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`welcome-spinner-blade blade-${i}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}