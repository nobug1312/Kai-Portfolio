"use client";

import Image from "next/image";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { ArrowUpRight, Maximize2, Minus, Move, Search, Terminal, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { MenuStatus } from "@/components/MenuStatus";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { site } from "@/lib/content";

const applications = [
  { id: "profile", label: "About Kai", title: "Kai Le", image: "profile", width: 680, height: 580 },
  { id: "terminal", label: "Terminal", title: "profile.sh", image: "terminal", width: 640, height: 480 },
  { id: "projects", label: "Projects", title: "Projects", image: "projects", width: 860, height: 610 },
  { id: "stack", label: "Tech Stack", title: "Core Technologies", image: "stack", width: 800, height: 590 },
  { id: "experience", label: "Experience", title: "Work & Education", image: "experience", width: 740, height: 610 },
] as const;

export type DesktopAppId = typeof applications[number]["id"];
type OpenWindow = { id: DesktopAppId; x: number; y: number; minimized: boolean; maximized: boolean };
type Drag = { id: DesktopAppId; pointerId: number; startX: number; startY: number; x: number; y: number; element: HTMLElement };

function DesktopMenu({ label, actions }: { label: string; actions: { label: string; run: () => void; disabled?: boolean }[] }) {
  return (
    <details className="mac-menu-group" onToggle={event => {
      const current = event.currentTarget;
      if (!current.open) return;
      current.parentElement?.querySelectorAll<HTMLDetailsElement>("details").forEach(menu => {
        if (menu !== current) menu.open = false;
      });
    }} onKeyDown={event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.currentTarget.open = false;
      event.currentTarget.querySelector("summary")?.focus();
    }}>
      <summary onPointerEnter={event => {
        const menu = event.currentTarget.parentElement as HTMLDetailsElement;
        if (!menu.open && menu.parentElement?.querySelector("details[open]")) menu.open = true;
      }}>{label}</summary>
      <div className="mac-menu-popover" role="group" aria-label={`${label} menu`}>
        {actions.map(action => <button type="button" key={action.label} disabled={action.disabled} onClick={event => {
          const menu = event.currentTarget.closest("details");
          menu?.querySelector("summary")?.focus({ preventScroll: true });
          menu?.removeAttribute("open");
          action.run();
        }}>{action.label}</button>)}
      </div>
    </details>
  );
}

export function Desktop({ panels }: { panels: Record<DesktopAppId, ReactNode> }) {
  const [ready, setReady] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState("");
  const drag = useRef<Drag | null>(null);
  const desktopRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLElement>(null);
  const pendingFocus = useRef<DesktopAppId | null>(null);
  const searchOpener = useRef<HTMLElement | null>(null);
  const windowAnimations = useRef(new Map<DesktopAppId, Animation>());
  const dockFrame = useRef(0);
  const pendingEntrance = useRef<{ id: DesktopAppId; from?: { opacity: string; transform: string }; minimized: boolean } | null>(null);
  const active = windows.findLast(window => !window.minimized)?.id;
  const activeWindow = windows.find(window => window.id === active);
  const matches = applications.filter(app => `${app.label} ${app.title}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (ready) desktopRef.current?.focus({ preventScroll: true });
  }, [ready]);

  function fitPosition(id: DesktopAppId, x: number, y: number) {
    const app = applications.find(application => application.id === id)!;
    const width = Math.min(app.width, window.innerWidth - 32);
    const height = Math.min(app.height, window.innerHeight - 148);
    return {
      x: Math.max(12, Math.min(window.innerWidth - width - 12, x)),
      y: Math.max(44, Math.min(window.innerHeight - height - 104, y)),
    };
  }

  useEffect(() => {
    function constrainWindows() {
      setWindows(previous => previous.map(current => ({ ...current, ...fitPosition(current.id, current.x, current.y) })));
    }
    window.addEventListener("resize", constrainWindows);
    return () => window.removeEventListener("resize", constrainWindows);
  }, []);

  useEffect(() => {
    if (!pendingFocus.current) return;
    desktopRef.current?.querySelector<HTMLElement>(`.mac-window[data-app="${pendingFocus.current}"]`)?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [windows]);

  useLayoutEffect(() => {
    const entrance = pendingEntrance.current;
    pendingEntrance.current = null;
    if (!entrance || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = desktopRef.current?.querySelector<HTMLElement>(`.mac-window[data-app="${entrance.id}"]`);
    if (!element?.animate) return;

    let animation: Animation;
    if (entrance.minimized) {
      const keyframes = buildDockKeyframes(entrance.id, element, true);
      animation = element.animate(keyframes, {
        duration: 280,
        easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        fill: "both"
      });
    } else {
      const from = entrance.from ?? {
        opacity: "0",
        transform: "translate3d(0, 8px, 0) scale(.96)",
      };
      animation = element.animate([from, { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }], {
        duration: 300,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "both"
      });
    }

    windowAnimations.current.set(entrance.id, animation);
    animation.finished.then(() => {
      if (windowAnimations.current.get(entrance.id) !== animation) return;
      windowAnimations.current.delete(entrance.id);
      animation.cancel();
    }).catch(() => {});
  }, [windows]);

  useEffect(() => {
    if (searchOpen || !searchOpener.current) return;
    searchOpener.current.focus({ preventScroll: true });
    searchOpener.current = null;
  }, [searchOpen]);

  useEffect(() => {
    const animations = windowAnimations.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function finishMotion() {
      if (motion.matches) for (const animation of animations.values()) animation.finish();
    }
    motion.addEventListener("change", finishMotion);
    return () => {
      motion.removeEventListener("change", finishMotion);
      for (const animation of animations.values()) animation.cancel();
    };
  }, []);

  useEffect(() => {
    function dismissMenus(event: globalThis.PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      desktopRef.current?.querySelectorAll<HTMLDetailsElement>(".mac-menu-group[open]").forEach(menu => {
        if (!menu.contains(target)) menu.open = false;
      });
    }
    document.addEventListener("pointerdown", dismissMenus);
    return () => document.removeEventListener("pointerdown", dismissMenus);
  }, []);

  useEffect(() => {
    function updateClock() {
      const parts = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(new Date());
      const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
      setClock(`${values.weekday} ${values.hour}:${values.minute} ${values.dayPeriod}`);
    }
    updateClock();
    const timer = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function openApp(id: DesktopAppId, { toggle = true }: { toggle?: boolean } = {}) {
    const app = applications.find(application => application.id === id)!;
    const existing = windows.find(current => current.id === id);

    // Click lại icon dock của cửa sổ đang active sẽ minimize; desktop icon (double-click) luôn mở
    if (toggle && existing && !existing.minimized && active === id) {
      hideWindow(id, "minimize");
      return;
    }

    const element = desktopRef.current?.querySelector<HTMLElement>(`.mac-window[data-app="${id}"]`);
    const interrupted = windowAnimations.current.has(id) && element && !existing?.minimized;
    const currentStyle = interrupted ? getComputedStyle(element) : null;
    pendingEntrance.current = !existing || existing.minimized || interrupted
      ? { id, minimized: existing?.minimized ?? false, from: currentStyle ? { opacity: currentStyle.opacity, transform: currentStyle.transform } : undefined }
      : null;
    windowAnimations.current.get(id)?.cancel();
    windowAnimations.current.delete(id);
    if (element) delete element.dataset.hiding;
    pendingFocus.current = id;
    searchOpener.current = null;
    setWindows(previous => {
      const existing = previous.find(window => window.id === id);
      const offset = previous.filter(current => !current.minimized).length * 20;
      const next = existing
        ? { ...existing, ...fitPosition(id, existing.x, existing.y), minimized: false }
        : { id, ...fitPosition(id, (window.innerWidth - Math.min(app.width, window.innerWidth - 32)) / 2 + offset, (window.innerHeight - Math.min(app.height, window.innerHeight - 148)) / 2 - 30 + offset), minimized: false, maximized: false };
      return [...previous.filter(window => window.id !== id), next];
    });
    setSearchOpen(false);
    setQuery("");
  }

  function activate(id: DesktopAppId) {
    setWindows(previous => {
      if (previous.findLast(current => !current.minimized)?.id === id) return previous;
      const current = previous.find(window => window.id === id);
      return current ? [...previous.filter(window => window.id !== id), current] : previous;
    });
  }

  function updateWindow(id: DesktopAppId, change: Partial<OpenWindow>) {
    setWindows(previous => previous.map(window => window.id === id ? { ...window, ...change } : window));
  }

  function buildDockKeyframes(id: DesktopAppId, element: HTMLElement, isExpanding: boolean) {
    const box = element.getBoundingClientRect();
    const dock = desktopRef.current?.querySelector<HTMLElement>(`.mac-dock [data-open-app="${id}"]`)?.getBoundingClientRect();
    const from = { opacity: 0, transform: "scale(0.2)" };
    const to = { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" };
    if (!dock) {
      return isExpanding ? [from, to] : [to, from];
    }

    const deltaX = (dock.x + dock.width / 2) - (box.x + box.width / 2);
    const deltaY = (dock.y + dock.height / 2) - (box.y + box.height / 2);
    const atDock = {
      opacity: 0,
      transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.2)`,
    };
    return isExpanding ? [atDock, to] : [to, atDock];
  }

  function hideWindow(id: DesktopAppId, mode: "close" | "minimize") {
    const element = desktopRef.current?.querySelector<HTMLElement>(`.mac-window[data-app="${id}"]`);
    const dockButton = desktopRef.current?.querySelector<HTMLButtonElement>(`.mac-dock [data-open-app="${id}"]`);
    function commitHide() {
      if (element?.contains(document.activeElement)) {
        const next = windows.findLast(current => current.id !== id && !current.minimized);
        pendingFocus.current = next?.id ?? null;
        if (!next) dockButton?.focus({ preventScroll: true });
      }
      setWindows(previous => mode === "close"
        ? previous.filter(current => current.id !== id)
        : previous.map(current => current.id === id ? { ...current, minimized: true } : current));
    }
    if (!element || !element.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commitHide();
      return;
    }
    if (element.dataset.hiding) return;
    
    windowAnimations.current.get(id)?.cancel();
    windowAnimations.current.delete(id);
    element.dataset.hiding = mode;

    let animation: Animation;
    if (mode === "minimize") {
      const keyframes = buildDockKeyframes(id, element, false);
      animation = element.animate(keyframes, {
        duration: 280,
        easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        fill: "forwards"
      });
    } else {
      const currentStyle = getComputedStyle(element);
      const from = { opacity: currentStyle.opacity, transform: currentStyle.transform };
      animation = element.animate([from, { opacity: 0, transform: "translate3d(0, 4px, 0) scale(.97)" }], {
        duration: 180,
        easing: "cubic-bezier(.32, .72, 0, 1)",
        fill: "forwards"
      });
    }

    windowAnimations.current.set(id, animation);
    animation.onfinish = () => {
      if (windowAnimations.current.get(id) !== animation) return;
      windowAnimations.current.delete(id);
      flushSync(commitHide);
      delete element.dataset.hiding;
      animation.cancel();
    };
    animation.oncancel = () => {
      if (windowAnimations.current.get(id) !== animation) return;
      windowAnimations.current.delete(id);
      delete element.dataset.hiding;
    };
  }

  function centerWindow(id: DesktopAppId) {
    const app = applications.find(application => application.id === id)!;
    updateWindow(id, { ...fitPosition(id, (window.innerWidth - Math.min(app.width, window.innerWidth - 32)) / 2, (window.innerHeight - Math.min(app.height, window.innerHeight - 148)) / 2 - 30), maximized: false });
  }

  function openSearch() {
    if (searchOpen) return;
    searchOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  useEffect(() => {
    function shortcut(event: globalThis.KeyboardEvent) {
      if (!ready) return;
      if (videoOpen && event.key === "Escape") {
        setVideoOpen(false);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.isComposing && event.code === "Space") {
        event.preventDefault();
        if (event.repeat) return;
        if (searchOpen) closeSearch();
        else openSearch();
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [searchOpen, ready, videoOpen]);

  function navigateSearch(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key === "Enter" && event.target instanceof HTMLInputElement && matches[0]) {
      event.preventDefault();
      openApp(matches[0].id);
      return;
    }
    const dialog = spotlightRef.current;
    if (!dialog) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const results = Array.from(dialog.querySelectorAll<HTMLButtonElement>(".spotlight-results button"));
      if (!results.length) return;
      event.preventDefault();
      const index = results.findIndex(button => button === document.activeElement);
      const next = event.key === "ArrowDown" ? (index + 1) % results.length : (index <= 0 ? results.length : index) - 1;
      results[next].focus();
    }
    if (event.key === "Tab") {
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>("input, button, a[href]"));
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }

  function startDrag(event: PointerEvent<HTMLElement>, current: OpenWindow) {
    if (current.maximized || window.innerWidth < 768 || event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    const element = event.currentTarget.closest<HTMLElement>(".mac-window");
    if (!element) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: current.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: current.x, y: current.y, element };
    element.dataset.dragging = "true";
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - current.startX) < 3 && Math.abs(event.clientY - current.startY) < 3) return;
    const { x, y } = fitPosition(current.id, current.x + event.clientX - current.startX, current.y + event.clientY - current.startY);
    current.element.style.left = `${x}px`;
    current.element.style.top = `${y}px`;
  }

  function finishDrag(event: PointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    updateWindow(current.id, { x: parseFloat(current.element.style.left), y: parseFloat(current.element.style.top) });
    delete current.element.dataset.dragging;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function magnifyDock(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const dock = event.currentTarget;
    const clientX = event.clientX;
    if (dockFrame.current) return;
    dockFrame.current = requestAnimationFrame(() => {
      dockFrame.current = 0;
      const items = Array.from(dock.querySelectorAll<HTMLElement>(".dock-application"));
      items.forEach(item => {
        const box = item.getBoundingClientRect();
        const influence = Math.exp(-((Math.abs(clientX - box.x - box.width / 2) / 76) ** 2));
        item.style.setProperty("--dock-scale", String(1 + influence * .3));
        item.style.setProperty("--dock-lift", `${influence * -10}px`);
      });
    });
  }

  function resetDock(event: PointerEvent<HTMLElement>) {
    if (dockFrame.current) {
      cancelAnimationFrame(dockFrame.current);
      dockFrame.current = 0;
    }
    event.currentTarget.querySelectorAll<HTMLElement>(".dock-application").forEach(item => {
      item.style.removeProperty("--dock-scale");
      item.style.removeProperty("--dock-lift");
    });
  }

  function openVideo() {
    setVideoOpen(true);
    void videoRef.current?.play().catch(() => {});
  }

  function closeVideo() {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setVideoOpen(false);
  }

  return (
    <main id="main" ref={desktopRef} tabIndex={-1} className="mac-desktop" data-ready={ready}>
      <div className="desktop-session" inert={!ready} aria-hidden={!ready || undefined}>
      <header className="mac-menubar" inert={searchOpen}>        <div className="mac-menu-left">
          <button type="button" className="mac-logo" onClick={() => openApp("profile")} aria-label="About Kai Le" title="About Kai Le"><Image src="/icons/devicon/apple.svg" alt="" width={16} height={18} /></button>
          <span className="mac-menu-app">{applications.find(app => app.id === active)?.label ?? "Finder"}</span>
          <nav aria-label="Applications" className="mac-app-menu">
            <DesktopMenu label="File" actions={[
              { label: "Open Projects", run: () => openApp("projects") },
              { label: "Open Terminal", run: () => openApp("terminal") },
              { label: "Close Window", disabled: !active, run: () => { if (active) hideWindow(active, "close"); } },
            ]} />
            <DesktopMenu label="Edit" actions={[{ label: "Find Applications", run: openSearch }]} />
            <DesktopMenu label="View" actions={[
              { label: activeWindow?.maximized ? "Restore Window" : "Zoom Window", disabled: !active, run: () => { if (activeWindow) updateWindow(activeWindow.id, { maximized: !activeWindow.maximized }); } },
              { label: "Center Window", disabled: !active, run: () => { if (active) centerWindow(active); } },
            ]} />
            <DesktopMenu label="Go" actions={[
              { label: "About Kai", run: () => openApp("profile") },
              { label: "Projects", run: () => openApp("projects") },
              { label: "Tech Stack", run: () => openApp("stack") },
            ]} />
            <DesktopMenu label="Window" actions={applications.map(app => ({ label: app.label, run: () => openApp(app.id) }))} />
            <DesktopMenu label="Help" actions={[{ label: "About Kai Le", run: () => openApp("profile") }]} />
          </nav>
        </div>
        <div className="mac-menu-right">
          <MenuStatus />
          <button type="button" className="mac-avatar" onClick={() => openApp("profile")} aria-label="Open profile" title="Profile"><UserCircleIcon size={18} weight="fill" aria-hidden="true" /></button>
          <time suppressHydrationWarning>{clock}</time>
        </div>
      </header>

      <nav aria-label="Desktop applications" className="desktop-applications" inert={searchOpen}>
        {applications.map(app => <button key={app.id} type="button" className="desktop-application" onDoubleClick={() => openApp(app.id, { toggle: false })} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openApp(app.id, { toggle: false }); } }}><Image src={`/desktop/icons/${app.image}.png`} width={64} height={64} alt="" /><span>{app.label}</span></button>)}
        <button type="button" className="desktop-application" aria-label="DO_NOT_OPEN video" onDoubleClick={openVideo} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openVideo(); } }}><Image src="/desktop/icons/quicktime.png" width={48} height={48} alt="" /><span>DO_NOT_OPEN</span></button>
      </nav>

      {windows.map((current, index) => {
        const app = applications.find(application => application.id === current.id)!;
        const style: CSSProperties = { left: current.x, top: current.y, width: app.width, height: app.height, zIndex: 20 + index };
        return (
          <section key={current.id} tabIndex={-1} style={style} className={`mac-window${current.minimized ? " is-minimized" : ""}${current.maximized ? " is-maximized" : ""}`} data-app={current.id} data-active={current.id === active} role="dialog" aria-modal="false" aria-label={app.title} aria-hidden={current.minimized || undefined} inert={current.minimized || searchOpen} onPointerDown={() => activate(current.id)} onFocusCapture={() => activate(current.id)}>
            <header className="mac-titlebar" onPointerDown={event => startDrag(event, current)} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag} onDoubleClick={event => { if (!(event.target as HTMLElement).closest("button")) updateWindow(current.id, { maximized: !current.maximized }); }}>
              <div className="mac-window-controls">
                <button type="button" className="window-close" aria-label={`Close ${app.title}`} title="Close" onClick={() => hideWindow(current.id, "close")}><X size={9} aria-hidden="true" /></button>
                <button type="button" className="window-minimize" aria-label={`Minimize ${app.title}`} title="Minimize" onClick={() => hideWindow(current.id, "minimize")}><Minus size={9} aria-hidden="true" /></button>
                <button type="button" className="window-maximize" aria-label={`${current.maximized ? "Restore" : "Maximize"} ${app.title}`} title={current.maximized ? "Restore" : "Maximize"} onClick={() => updateWindow(current.id, { maximized: !current.maximized })}><Maximize2 size={8} aria-hidden="true" /></button>
              </div>
              <span className="mac-window-title">{current.id === "terminal" && <Terminal size={14} aria-hidden="true" />}<span>{app.title}</span></span>
              <button type="button" className="mac-center-window" aria-label={`Center ${app.title}`} title="Center window" onClick={() => centerWindow(current.id)}><Move size={14} aria-hidden="true" /></button>
            </header>
            <div className="mac-window-body">{panels[current.id]}</div>
          </section>
        );
      })}

      <nav className="mac-dock" aria-label="Dock" inert={searchOpen} onPointerMove={magnifyDock} onPointerLeave={resetDock}>
        <div className="mac-dock-glass">
          <div className="mac-dock-inner">
            {applications.map(app => <button type="button" key={app.id} className="dock-application" data-open-app={app.id} data-running={windows.some(window => window.id === app.id)} data-active={active === app.id} aria-label={`Open ${app.label}`} onClick={() => openApp(app.id)}><span className="dock-tooltip" aria-hidden="true">{app.label}</span><Image src={`/desktop/icons/${app.image}.png`} width={48} height={48} alt="" /><span className="dock-running" aria-hidden="true" /></button>)}
            <span className="dock-divider" aria-hidden="true" />
            <a className="dock-application" href={`mailto:${site.email}`} aria-label={`Email ${site.name}`}><span className="dock-tooltip" aria-hidden="true">Email</span><Image src="/desktop/icons/mail.png" width={48} height={48} alt="" /></a>
            <a className="dock-application" href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)"><span className="dock-tooltip" aria-hidden="true">GitHub</span><Image src="/desktop/icons/github.png" width={48} height={48} alt="" /></a>
          </div>
        </div>
      </nav>

      <div className="desktop-video-backdrop" hidden={!videoOpen} role="presentation" onClick={closeVideo}><section className="desktop-video-window" role="dialog" aria-modal="true" aria-label="DO_NOT_OPEN video" onClick={event => event.stopPropagation()}><header><strong>DO_NOT_OPEN</strong><button type="button" aria-label="Close video" onClick={closeVideo}><X size={16} aria-hidden="true" /></button></header><video ref={videoRef} src="/desktop/videomeme.mp4" preload="auto" controls playsInline /></section></div>

      {searchOpen && <div className="spotlight-backdrop" onClick={closeSearch}><section ref={spotlightRef} className="mac-spotlight" role="dialog" aria-modal="true" aria-label="Spotlight" onClick={event => event.stopPropagation()} onKeyDown={navigateSearch}><label className="spotlight-input"><Search size={22} aria-hidden="true" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Spotlight Search" aria-label="Search applications" /><button type="button" aria-label="Close Spotlight" onClick={closeSearch}><X size={18} aria-hidden="true" /></button></label><div className="spotlight-results">{matches.map(app => <button key={app.id} type="button" onClick={() => openApp(app.id)}><Image src={`/desktop/icons/${app.image}.png`} width={30} height={30} alt="" /><span>{app.label}</span><ArrowUpRight size={14} aria-hidden="true" /></button>)}{!matches.length && <p className="spotlight-empty" role="status">No applications found</p>}</div></section></div>}
      </div>
      {!ready && <WelcomeScreen onComplete={() => {
        setReady(true);
        openApp("profile", { toggle: false });
      }} />}
    </main>
  );
}