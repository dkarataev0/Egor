import advantages from "@/data/advantages.json";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { Icon, type IconName } from "./Icons";

export default function Advantages() {
  return (
    <section id="why" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionTitle className="mt-3 max-w-2xl">Шесть причин выбрать «АртВитраж»</SectionTitle>
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a, i) => {
            const I = Icon[a.icon as IconName];
            return (
              <Reveal as="li" key={a.title} delay={(i % 3) * 80}>
                <div className="group relative h-full pt-6">
                  <span aria-hidden="true" className="draw-line absolute inset-x-0 top-0 h-px bg-ink/20 transition-colors group-hover:bg-teal" style={{ transitionDelay: "0s" }} />
                  <span className="icon-pop grid size-12 place-items-center rounded-2xl bg-teal-soft text-teal-dark ring-1 ring-brass/40"><I className="size-6" /></span>
                  <h3 className="mt-5 text-lg font-extrabold">{a.title}</h3>
                  <p className="mt-2 text-ink-soft">{a.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
