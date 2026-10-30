"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import company from "@/data/company.json";
import { useLead } from "./LeadProvider";

export default function Hero() {
  const { open } = useLead();
  const root = useRef<HTMLElement>(null);

  // Параллакс: фон и блики смещаются медленнее прокрутки
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.current?.style.setProperty("--py", String(Math.min(window.scrollY, window.innerHeight)));
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={root} id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-20 will-change-transform" style={{ transform: "translate3d(0, calc(var(--py, 0) * 0.25px), 0) scale(1.08)" }}>
        <Image src="/images/hero/hero.webp" alt="Стеклянная конструкция с бликами света" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true" style={{ transform: "translate3d(0, calc(var(--py, 0) * -0.12px), 0)" }}>
        <span className="orb" style={{ left: "58%", top: "12%", width: "26rem", height: "26rem" }} />
        <span className="orb" style={{ left: "78%", top: "52%", width: "18rem", height: "18rem", ["--delay" as string]: "-5s" }} />
        <span className="orb" style={{ left: "40%", top: "62%", width: "12rem", height: "12rem", ["--delay" as string]: "-9s" }} />
        <span className="glint" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b2327]/80 via-[#0b2327]/45 to-transparent" />
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6">
        <p className="eyebrow rise !text-[#e6cf9f]" style={{ "--i": 0 } as React.CSSProperties}>{company.city} · изделия из стекла</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,6.5vw,4.75rem)] font-extrabold leading-[1.02] text-white">
          {["Стекло, которое", "пропускает свет", "и держит форму"].map((t, i) => (
            <span key={t} className="line-mask"><span style={{ "--i": i + 1 } as React.CSSProperties}>{t}</span></span>
          ))}
        </h1>
        <p className="rise mt-6 max-w-xl text-lg text-white/85" style={{ "--i": 4 } as React.CSSProperties}>
          Стеклянные перила и ограждения, душевые кабины, окна и остекление. Замер, проект, производство и монтаж.
        </p>
        <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--i": 5 } as React.CSSProperties}>
          <a href="#calculator" className="btn btn-primary btn-glint">Рассчитать стоимость</a>
          <button onClick={() => open()} className="btn btn-ghost">Оставить заявку</button>
        </div>
        <ul className="rise mt-12 flex flex-wrap gap-3 text-sm text-white" style={{ "--i": 6 } as React.CSSProperties}>
          {["Закалённое стекло", "Монтаж под ключ", "Замер на объекте"].map((t) => (
            <li key={t} className="glass !bg-white/15 rounded-full px-4 py-2 !text-white">{t}</li>
          ))}
        </ul>
      </div>
      <a href="#services" aria-label="Прокрутить к услугам" className="absolute bottom-6 left-1/2 hidden h-12 w-6 -translate-x-1/2 overflow-hidden rounded-full border border-white/60 sm:block">
        <span className="scroll-cue absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-white" />
      </a>
    </section>
  );
}
