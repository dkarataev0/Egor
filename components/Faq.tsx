"use client";
import { useState } from "react";
import faq from "@/data/faq.json";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { Icon } from "./Icons";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-3xl">
      <Reveal>
        <SectionTitle className="mt-3">Частые вопросы</SectionTitle>
      </Reveal>
      <div className="mt-10 grid gap-3">
        {faq.map((f, i) => {
          const on = open === i;
          return (
            <Reveal key={f.q} delay={i * 40}>
              <div className="rounded-2xl border border-line bg-surface">
                <h3>
                  <button
                    onClick={() => setOpen(on ? null : i)}
                    aria-expanded={on}
                    aria-controls={`faq-${i}`}
                    id={`faq-btn-${i}`}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-display text-lg font-bold"
                  >
                    {f.q}
                    <Icon.plus className={`size-5 shrink-0 text-teal transition-transform ${on ? "rotate-45" : ""}`} />
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} className={`grid transition-[grid-template-rows] duration-300 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 text-ink-soft">{f.a}</p></div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      </div>
    </section>
  );
}
