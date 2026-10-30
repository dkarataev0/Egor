import Link from "next/link";
import company from "@/data/company.json";
import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface pb-24 pt-12 lg:pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">Изделия из стекла в Краснодаре: перила, ограждения, окна и душевые кабины.</p>
        </div>
        <div className="text-sm text-ink-soft">
          <a href={`tel:${company.phone}`} className="block font-display text-lg font-bold text-ink">{company.phoneDisplay}</a>
          <p className="mt-1">{company.hours}</p>
        </div>
        <div className="text-sm text-ink-soft">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-teal">Политика конфиденциальности</Link>
          <p className="mt-2">© {new Date().getFullYear()} АртВитраж</p>
        </div>
      </div>
    </footer>
  );
}
