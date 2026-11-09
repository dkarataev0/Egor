import Link from "next/link";
import company from "@/data/company.json";
import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface pb-24 pt-12 lg:pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo site={false} />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">Конструкции из закалённого стекла на заказ в Краснодаре: перегородки, двери, душевые, ограждения и зеркала.</p>
        </div>
        <div className="text-sm text-ink-soft">
          <a href={`tel:${company.phone}`} className="inline-flex min-h-11 items-center font-display text-lg font-bold text-ink">{company.phoneDisplay}</a>
          <p className="mt-1">{company.hours}</p>
          {company.address && <p className="mt-1">{company.address}</p>}
        </div>
        <div className="text-sm text-ink-soft">
          <Link href="/privacy" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-gold-text">Политика конфиденциальности</Link>
          <p className="mt-2">© {new Date().getFullYear()} АртВитраж</p>
        </div>
      </div>
    </footer>
  );
}
