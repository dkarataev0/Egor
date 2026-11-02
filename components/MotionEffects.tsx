"use client";
import { useEffect } from "react";

// Магнитные кнопки: элементы с data-magnetic слегка тянутся к курсору. Только мышь, без reduced-motion.
export default function MotionEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current: HTMLElement | null = null;
    const reset = () => { if (current) { current.style.translate = ""; current = null; } };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-magnetic]");
      if (el !== current) reset();
      if (!el) return;
      current = el;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.18;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", reset); reset(); };
  }, []);
  return null;
}
