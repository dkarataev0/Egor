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
    const mouse = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      root.current?.style.setProperty("--px", String((e.clientX / window.innerWidth - 0.5).toFixed(3)));
      root.current?.style.setProperty("--pz", String((e.clientY / window.innerHeight - 0.5).toFixed(3)));
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("pointermove", mouse, { passive: true });
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("pointermove", mouse); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={root} id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-20" style={{ transform: "translate3d(0, calc(var(--py, 0) * 0.25px), 0) scale(1.08)" }}>
        <Image src="/images/hero/hero.webp" alt="Стеклянная конструкция с бликами света" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true" style={{ transform: "translate3d(0, calc(var(--py, 0) * -0.12px), 0)", translate: "calc(var(--px, 0) * -36px) calc(var(--pz, 0) * -24px)" }}>
        <span className="orb" style={{ left: "58%", top: "12%", width: "26rem", height: "26rem" }} />
        <span className="orb" style={{ left: "78%", top: "52%", width: "18rem", height: "18rem", ["--delay" as string]: "-5s" }} />
        <span className="orb" style={{ left: "40%", top: "62%", width: "12rem", height: "12rem", ["--delay" as string]: "-9s" }} />
        <span className="glint" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-scrim/80 via-scrim/45 to-transparent" />
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6">
        <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,6.5vw,4.75rem)] font-extrabold leading-[1.02] text-white">
          {["Стекло, которое", "пропускает свет", "и держит форму"].map((t, i) => (
            <span key={t} className="line-mask"><span style={{ "--i": i + 1 } as React.CSSProperties}>{t}</span></span>
          ))}
        </h1>
        <p className="rise mt-6 max-w-xl text-lg text-white/85" style={{ "--i": 2 } as React.CSSProperties}>
          Перила, душевые кабины и окна из стекла под ключ в Краснодаре.
        </p>
        <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as React.CSSProperties}>
          <a href="#calculator" data-magnetic className="btn btn-primary btn-glint">Рассчитать стоимость</a>
          <button onClick={() => open()} data-magnetic className="btn btn-ghost">Оставить заявку</button>
        </div>
      </div>
      <a href="#services" aria-label="Прокрутить к услугам" className="absolute bottom-6 left-1/2 hidden h-12 w-6 -translate-x-1/2 overflow-hidden rounded-full border border-white/60 sm:block">
        <span className="scroll-cue absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-white" />
      </a>
    </section>
  );
}
