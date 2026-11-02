"use client";
import { useEffect } from "react";

// Глобальные эффекты по data-атрибутам:
//   data-magnetic  кнопка слегка тянется к курсору (только мышь)
//   data-spotlight золотой отсвет следует за курсором по карточке (только мышь)
//   data-parallax  элемент смещается при прокрутке (data-parallax="12" — амплитуда в px)
// При prefers-reduced-motion ничего не включается.
export default function MotionEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let magnet: HTMLElement | null = null;
    const resetMagnet = () => { if (magnet) { magnet.style.translate = ""; magnet = null; } };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as HTMLElement;

      const el = target.closest<HTMLElement>("[data-magnetic]");
      if (el !== magnet) resetMagnet();
      if (el) {
        magnet = el;
        const r = el.getBoundingClientRect();
        el.style.translate = `${((e.clientX - (r.left + r.width / 2)) * 0.18).toFixed(1)}px ${((e.clientY - (r.top + r.height / 2)) * 0.28).toFixed(1)}px`;
      }

      const sp = target.closest<HTMLElement>("[data-spotlight]");
      if (sp) {
        const r = sp.getBoundingClientRect();
        sp.style.setProperty("--sx", `${(e.clientX - r.left).toFixed(0)}px`);
        sp.style.setProperty("--sy", `${(e.clientY - r.top).toFixed(0)}px`);
      }
    };

    let raf = 0;
    const parallax = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const host = el.parentElement!.getBoundingClientRect();
        if (host.bottom < -50 || host.top > vh + 50) return;
        const p = Math.max(-1, Math.min(1, (host.top + host.height / 2 - vh / 2) / vh));
        const amp = Number(el.dataset.parallax) || 14;
        el.style.translate = `0 ${(p * amp).toFixed(1)}px`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(parallax); };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", resetMagnet);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    parallax();
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", resetMagnet);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      resetMagnet();
    };
  }, []);
  return null;
}
