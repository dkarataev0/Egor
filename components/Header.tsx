"use client";
import { useEffect, useState } from "react";
import company from "@/data/company.json";
import { Icon } from "./Icons";
import { useLead } from "./LeadProvider";

const nav = [
  ["#services", "Услуги"],
  ["#calculator", "Калькулятор"],
  ["#works", "Работы"],
  ["#why", "Почему мы"],
  ["#steps", "Этапы"],
  ["#reviews", "Отзывы"],
  ["#faq", "FAQ"],
  ["#contacts", "Контакты"],
];

export function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  // TODO: заменить на public/logo.svg, когда будет готов логотип
  return (
    <a href="#top" className={`flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight ${className}`} aria-label="АртВитраж — на главную">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-teal to-teal-dark text-white">
        <span className="absolute -left-2 top-0 h-full w-3 rotate-12 bg-white/30" />
        <span className="text-base">А</span>
      </span>
      <span>Арт<span className={light ? "text-[#8fe0e6]" : "text-teal"}>Витраж</span></span>
    </a>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { open } = useLead();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const light = !scrolled && !menu;
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all ${light ? "text-white" : "glass !rounded-none !border-x-0 !border-t-0 shadow-sm"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo light={light} />
        <nav aria-label="Основное меню" className="hidden items-center gap-6 text-sm font-medium xl:flex">
          {nav.map(([h, t]) => (
            <a key={h} href={h} className="rounded py-2 opacity-90 transition hover:underline hover:underline-offset-8 hover:opacity-100">{t}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={`tel:${company.phone}`} className="hidden font-display font-bold sm:block">{company.phoneDisplay}</a>
          <button onClick={() => open()} className="btn btn-primary hidden !min-h-10 !px-5 sm:inline-flex">Заявка</button>
          <button
            onClick={() => setMenu((v) => !v)}
            className="grid size-11 place-items-center rounded-full xl:hidden"
            aria-label={menu ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menu}
            aria-controls="mobile-menu"
          >
            {menu ? <Icon.close /> : <Icon.menu />}
          </button>
        </div>
      </div>
      {menu && (
        <nav id="mobile-menu" aria-label="Мобильное меню" className="border-t border-line px-4 pb-5 pt-2 xl:hidden">
          <ul className="grid">
            {nav.map(([h, t]) => (
              <li key={h}>
                <a href={h} onClick={() => setMenu(false)} className="block border-b border-line/60 py-3.5 text-lg font-medium">{t}</a>
              </li>
            ))}
          </ul>
          <button onClick={() => { setMenu(false); open(); }} className="btn btn-primary mt-4 w-full">Оставить заявку</button>
        </nav>
      )}
    </header>
  );
}
