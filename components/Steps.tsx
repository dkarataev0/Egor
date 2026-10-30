import steps from "@/data/steps.json";
import Reveal from "./Reveal";

export default function Steps() {
  return (
    <section id="steps" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <p className="eyebrow">Этапы работы</p>
        <h2 className="section-title mt-3">От замера до монтажа</h2>
      </Reveal>
      <Reveal className="relative mt-14">
        <span aria-hidden="true" className="draw-line absolute left-0 right-0 top-[7px] hidden h-px bg-brass/70 md:block" />
        <ol className="grid gap-5 md:grid-cols-4 md:pt-9">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span aria-hidden="true" className="step-dot absolute -top-9 left-7 hidden size-3.5 rounded-full bg-brass ring-4 ring-bg md:block" style={{ "--i": i } as React.CSSProperties} />
              <div className="h-full rounded-3xl bg-gradient-to-br from-white to-teal-soft/60 p-7 ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="font-display text-5xl font-extrabold text-brass/70">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-xl font-extrabold">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
