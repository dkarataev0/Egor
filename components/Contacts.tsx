import company from "@/data/company.json";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { Icon } from "./Icons";

export default function Contacts() {
  const { lat, lon } = company.geo;
  const rows = [
    { i: Icon.phone, t: "Телефон", v: company.phoneDisplay, h: `tel:${company.phone}` },
    { i: Icon.chat, t: "WhatsApp", v: "Написать в WhatsApp", h: company.whatsapp },
    { i: Icon.chat, t: "Telegram", v: "Написать в Telegram", h: company.telegram },
    { i: Icon.chat, t: "MAX", v: "Написать в MAX", h: company.max },
    { i: Icon.pin, t: "Адрес", v: company.address },
    { i: Icon.clock, t: "Часы работы", v: company.hours },
  ].filter((r) => r.v && r.h !== ""); // пустые поля в company.json скрываются
  return (
    <section id="contacts" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <SectionTitle className="mt-3">Свяжитесь с нами</SectionTitle>
      </Reveal>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <ul className="glass stagger grid gap-1 rounded-3xl p-4 sm:p-6">
            {rows.map(({ i: I, t, v, h }, idx) => (
              <li key={t} style={{ "--i": idx } as React.CSSProperties}>
                {h ? (
                  <a href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-teal-soft">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal text-white"><I className="size-5" /></span>
                    <span><span className="block text-xs uppercase tracking-wider text-ink-soft">{t}</span><span className="font-semibold">{v}</span></span>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 p-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal text-white"><I className="size-5" /></span>
                    <span><span className="block text-xs uppercase tracking-wider text-ink-soft">{t}</span><span className="font-semibold">{v}</span></span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <div className="clip-reveal h-80 overflow-hidden rounded-3xl border border-line lg:h-full lg:min-h-[28rem]">
            <iframe
              title="Карта: Краснодар"
              src={`https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=12&pt=${lon},${lat},pm2rdm`}
              loading="lazy"
              className="size-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
