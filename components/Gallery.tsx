"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import works from "@/data/works.json";
import services from "@/data/services.json";
import Reveal from "./Reveal";
import { Icon } from "./Icons";

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [idx, setIdx] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const list = filter === "all" ? works : works.filter((w) => w.service === filter);

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

  const tabs = [{ id: "all", title: "Все" }, ...services.map((s) => ({ id: s.id, title: s.title }))];
  const cur = idx !== null ? list[idx] : null;

  return (
    <section id="works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <h2 className="section-title mt-3">Примеры наших изделий</h2>
      </Reveal>
      <div role="group" aria-label="Фильтр по услугам" className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            aria-pressed={filter === t.id}
            className={`shrink-0 rounded-full border min-h-11 px-4 text-sm font-semibold transition ${filter === t.id ? "border-teal bg-teal text-white" : "border-line bg-white hover:border-teal"}`}
          >
            {t.title}
          </button>
        ))}
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {list.map((w, i) => (
          <li key={`${filter}-${w.id}`} className="pop-in" style={{ "--i": i } as React.CSSProperties}>
            <button onClick={() => setIdx(i)} className="shine group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl" aria-label={`Открыть фото: ${w.title}`}>
              <Image src={w.image} alt={w.title} fill sizes="(min-width:1024px) 33vw, 50vw" loading="lazy" className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10 text-left text-sm font-semibold text-white">{w.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dlg} onClose={() => setIdx(null)} onClick={(e) => e.target === dlg.current && setIdx(null)} aria-label="Просмотр фото" className="m-auto max-h-[92dvh] w-[min(64rem,96vw)] overflow-visible bg-transparent p-0 backdrop:bg-black/80">
        {cur && (
          <figure className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
              <Image src={cur.image} alt={cur.title} fill sizes="96vw" className="lb-img object-contain" key={cur.image} />
            </div>
            <figcaption className="mt-3 text-center text-white">{cur.title}</figcaption>
            <button onClick={() => setIdx(null)} aria-label="Закрыть" className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-white/90"><Icon.close /></button>
            <button onClick={() => step(-1)} aria-label="Предыдущее фото" className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90"><Icon.arrow className="rotate-180" /></button>
            <button onClick={() => step(1)} aria-label="Следующее фото" className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90"><Icon.arrow /></button>
          </figure>
        )}
      </dialog>
    </section>
  );
}
