"use client";
import Image from "next/image";
import services from "@/data/services.json";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import Tilt from "./Tilt";
import { useLead } from "./LeadProvider";

export const rub = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

export default function Services() {
  const { open } = useLead();
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <SectionTitle className="mt-3 max-w-2xl">Что мы делаем из стекла</SectionTitle>
      </Reveal>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal as="li" key={s.id} delay={i * 80}>
            <Tilt className="h-full rounded-3xl"><article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_10px_30px_-18px_rgba(14,124,134,0.4)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(14,124,134,0.55)]">
              <div className="shine relative aspect-[3/2] overflow-hidden">
                <Image src={s.image} alt={s.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-extrabold">{s.title}</h3>
                <p className="mt-2 flex-1 text-ink-soft">{s.description}</p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-sm text-ink-soft">
                    от <b className="font-display text-lg text-ink">{rub(s.priceFrom)}</b>
                    {s.unit && <span> {s.unit}</span>}
                  </p>
                  <button onClick={() => open({ serviceId: s.id })} className="btn btn-outline !min-h-11">
                    Заказать
                  </button>
                </div>
              </div>
            </article></Tilt>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
