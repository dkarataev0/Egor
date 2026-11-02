"use client";
import { useEffect, useRef, useState } from "react";
import LogoSvg from "./LogoSvg";

const PLAY_MS = 3800;  // анимация логотипа 3,35 с и короткая пауза
const FLY_MS = 1000;   // перелёт в шапку

// Заставка при входе: логотип рисуется по центру, затем «улетает» в левый верх и становится логотипом шапки.
// Показывается раз за сессию (sessionStorage) и не показывается при prefers-reduced-motion.
// Класс html.intro-running ставит скрипт в <head> до первой отрисовки, поэтому без JS заставки нет.
export default function Intro() {
  const [gone, setGone] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const phase = useRef<"play" | "leave" | "done">("play");
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-running")) { setGone(true); return; }
    root.style.overflow = "hidden";
    const timers: number[] = [];

    const finish = () => {
      phase.current = "done";
      root.classList.remove("intro-running");
      root.style.overflow = "";
      setGone(true);
    };
    const fly = () => {
      if (phase.current !== "play") return;
      phase.current = "leave";
      try { sessionStorage.setItem("introSeen", "1"); } catch { /* приватный режим */ }
      const el = stage.current, ov = overlay.current;
      const target = document.querySelector<SVGElement>("[data-site-logo] svg");
      if (!el || !ov || !target) { finish(); return; }
      const a = el.getBoundingClientRect(), b = target.getBoundingClientRect();
      const s = b.width / a.width;
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      el.style.transition = `transform ${FLY_MS}ms cubic-bezier(0.65, 0, 0.35, 1), color ${FLY_MS}ms ease`;
      el.style.color = getComputedStyle(target).color;
      ov.classList.add("is-leaving");
      requestAnimationFrame(() => { el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`; });
      timers.push(window.setTimeout(finish, FLY_MS + 80));
    };
    const skip = () => {
      if (phase.current !== "play") return;
      stage.current?.querySelector(".lg")?.classList.add("lg-settled"); // сразу финальный вид логотипа
      timers.push(window.setTimeout(fly, 60));
    };
    timers.push(window.setTimeout(fly, PLAY_MS));
    const onKey = (e: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); skip(); } };
    window.addEventListener("keydown", onKey);
    skipRef.current = skip;
    return () => { timers.forEach(clearTimeout); window.removeEventListener("keydown", onKey); root.style.overflow = ""; };
  }, []);

  if (gone) return null;
  return (
    <div ref={overlay} className="intro-overlay" onClick={() => skipRef.current()}>
      <div ref={stage} className="intro-stage">
        <LogoSvg className="lg-play" label="АртВитраж: стекло, алюминий, конструкции" />
      </div>
      <button type="button" className="intro-skip" onClick={(e) => { e.stopPropagation(); skipRef.current(); }}>
        Пропустить
      </button>
    </div>
  );
}
