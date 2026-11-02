"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import pairs from "@/data/before-after.json";

type Pair = { id: string; title: string; before: string; after: string };

function Slider({ pair }: { pair: Pair }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const touched = useRef(false);

  // Один раз при появлении на экране «показываем», что ползунок двигается
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        if (touched.current) return;
        const k = Math.min(1, (now - t0) / 1400);
        setPos(8 + 42 * (1 - (1 - k) ** 3));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      setPos(8);
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const fromEvent = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    touched.current = true;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <figure className="mx-auto w-full max-w-3xl">
      <div
        ref={box}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e.clientX); }}
        onPointerMove={(e) => e.buttons === 1 && fromEvent(e.clientX)}
        className="relative aspect-[3/2] cursor-ew-resize select-none overflow-hidden rounded-3xl border border-line"
        style={{ touchAction: "pan-y" }}
      >
        <Image src={pair.after} alt={`${pair.title}: после`} fill sizes="(min-width:768px) 768px, 100vw" className="pointer-events-none object-cover" />
        <div className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={pair.before} alt={`${pair.title}: до`} fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
        </div>
        <span className="glass pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-semibold">До</span>
        <span className="glass pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1 text-sm font-semibold">После</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold-light" style={{ left: `${pos}%` }}>
          <button
            type="button"
            role="slider"
            aria-label={`Сравнение до и после: ${pair.title}`}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
            onKeyDown={(e) => {
              const d = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : e.key === "Home" ? -100 : e.key === "End" ? 100 : 0;
              if (d) { e.preventDefault(); touched.current = true; setPos((p) => Math.min(100, Math.max(0, p + d))); }
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-on-gold shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-soft">{pair.title}. Потяните ползунок.</figcaption>
    </figure>
  );
}

export default function BeforeAfter() {
  const list = pairs as Pair[];
  if (!list.length) return null;
  return (
    <div className="mt-16">
      <h3 className="mb-6 text-center font-display text-2xl font-extrabold">До и после</h3>
      <div className="grid gap-10">{list.map((p) => <Slider key={p.id} pair={p} />)}</div>
    </div>
  );
}
