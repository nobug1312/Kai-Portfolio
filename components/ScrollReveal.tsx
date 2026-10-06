"use client";

import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !("IntersectionObserver" in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });

    for (const target of targets) {
      target.querySelectorAll<HTMLElement>(".reveal-item").forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 100}ms`);
      });
      target.dataset.revealed = "false";
      observer.observe(target);
    }

    function showAll() {
      if (!motion.matches) return;
      observer.disconnect();
      for (const target of targets) target.dataset.revealed = "true";
    }

    motion.addEventListener("change", showAll);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", showAll);
      for (const target of targets) {
        delete target.dataset.revealed;
        target.querySelectorAll<HTMLElement>(".reveal-item").forEach(item => {
          item.style.removeProperty("--reveal-delay");
        });
      }
    };
  }, []);

  return null;
}