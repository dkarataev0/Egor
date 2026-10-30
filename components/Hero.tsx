"use client";
import Image from "next/image";
import company from "@/data/company.json";
import { useLead } from "./LeadProvider";

export default function Hero() {
  const { open } = useLead();
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      <Image src="/images/hero/hero.webp" alt="Стеклянная конструкция с бликами света" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b2327]/80 via-[#0b2327]/45 to-transparent" />
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6">
        <p className="eyebrow !text-[#e6cf9f]">{company.city} · изделия из стекла</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,6.5vw,4.75rem)] font-extrabold leading-[1.02] text-white">
          Стекло, которое пропускает свет и&nbsp;держит форму
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/85">
          Стеклянные перила и ограждения, душевые кабины, окна и остекление. Замер, проект, производство и монтаж.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a href="#calculator" className="btn btn-primary">Рассчитать стоимость</a>
          <button onClick={() => open()} className="btn btn-ghost">Оставить заявку</button>
        </div>
        <ul className="mt-12 flex flex-wrap gap-3 text-sm text-white">
          {["Закалённое стекло", "Монтаж под ключ", "Замер на объекте"].map((t) => (
            <li key={t} className="glass !bg-white/15 rounded-full px-4 py-2 !text-white">{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
