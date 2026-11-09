"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import works from "@/data/works.json";
import services from "@/data/services.json";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import BeforeAfter from "./BeforeAfter";
import { Icon } from "./Icons";

const PAGE = 12; // сколько фото показываем за раз
const titleOf = (id: string) => services.find((s) => s.id === id)?.title ?? "";

// «Все»: категории чередуются по кругу, чтобы первая страница показывала разные услуги
const interleaved = (() => {
  const groups = services.map((s) => works.filter((w) => w.service === s.id)).filter((g) => g.length);
  const out: typeof works = [];
  for (let i = 0; groups.some((g) => i < g.length); i++) for (const g of groups) if (i < g.length) out.push(g[i]);
  return out;
})();

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const [idx, setIdx] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  const list = useMemo(() => (filter === "all" ? interleaved : works.filter((w) => w.service === filter)), [filter]);
  // Вкладки: только услуги, у которых есть фото, в порядке services.json
  const tabs = useMemo(() => {
    const has = new Set(works.map((w) => w.service));
    return [{ id: "all", title: "Все" }, ...services.filter((s) => has.has(s.id)).map((s) => ({ id: s.id, title: s.title }))];
  }, []);

  const step = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (idx !== null && !d.open) d.showModal();
    if (idx === null && d.open) d.close();
  }, [idx]);

  useEffect(() => {
    if (idx === null) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [idx, step]);

  const cur = idx !== null ? list[idx] : null;
  const visible = list.slice(0, shown);

  return (
    <section id="works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <SectionTitle>Фото наших работ</SectionTitle>
        <p className="mt-3 max-w-xl text-ink-soft">Реальные объекты в Краснодаре: от душевых до входных групп.</p>
      </Reveal>
      <div role="group" aria-label="Фильтр по услугам" className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setFilter(t.id); setShown(PAGE); }}
            aria-pressed={filter === t.id}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${filter === t.id ? "border-gold bg-gold text-on-gold" : "border-line bg-surface hover:border-gold"}`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* «Кирпичная» раскладка: фото сохраняют свои пропорции (много вертикальных кадров) */}
      <ul className="mt-8 columns-2 gap-3 sm:gap-4 lg:columns-3">
        {visible.map((w, i) => (
          <Reveal as="li" key={`${filter}-${w.id}`} className="mb-3 break-inside-avoid sm:mb-4" delay={(i % 3) * 80}>
            <button onClick={() => setIdx(i)} className="shine group relative block w-full overflow-hidden rounded-2xl bg-surface" style={{ aspectRatio: `${w.w} / ${w.h}` }} aria-label={`Открыть фото: ${titleOf(w.service)}`}>
              <Image src={w.image} alt={`${titleOf(w.service)}: фото работы`} fill sizes="(min-width:1024px) 33vw, 50vw" loading="lazy" className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-left text-sm font-semibold text-white">{titleOf(w.service)}</span>
            </button>
          </Reveal>
        ))}
      </ul>

      {shown < list.length && (
        <div className="mt-8 text-center">
          <button onClick={() => setShown((n) => n + PAGE)} className="btn btn-outline">
            Показать ещё ({list.length - shown})
          </button>
        </div>
      )}

      <BeforeAfter />

      <dialog ref={dlg} onClose={() => setIdx(null)} onClick={(e) => e.target === dlg.current && setIdx(null)} aria-label="Просмотр фото" className="m-auto max-h-[94dvh] w-[min(64rem,96vw)] overflow-visible bg-transparent p-0 backdrop:bg-black/80">
        {cur && (
          <figure className="relative flex flex-col items-center">
            <Image key={cur.image} src={cur.image} alt={`${titleOf(cur.service)}: фото работы`} width={cur.w} height={cur.h} sizes="96vw" className="lg-img max-h-[82dvh] w-auto rounded-2xl object-contain" />
            <figcaption className="mt-3 text-center text-white">{titleOf(cur.service)} · {(idx ?? 0) + 1} из {list.length}</figcaption>
            <button onClick={() => setIdx(null)} aria-label="Закрыть" className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-white/90 text-on-gold"><Icon.close /></button>
            <button onClick={() => step(-1)} aria-label="Предыдущее фото" className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-on-gold"><Icon.arrow className="rotate-180" /></button>
            <button onClick={() => step(1)} aria-label="Следующее фото" className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-on-gold"><Icon.arrow /></button>
          </figure>
        )}
      </dialog>
    </section>
  );
}
