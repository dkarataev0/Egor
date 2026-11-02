import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import reviews from "@/data/reviews.json";
import { Icon } from "./Icons";

type Review = { name: string; text: string; rating?: number; date?: string };

export default function Reviews() {
  const list = reviews as Review[];
  return (
    <section id="reviews" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionTitle className="mt-3">Что говорят клиенты</SectionTitle>
        </Reveal>
        {list.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-teal/40 bg-bg p-10 text-center text-ink-soft">
            Здесь появятся отзывы наших клиентов.
            {/* TODO: добавить реальные отзывы в data/reviews.json */}
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {list.map((r) => (
              <li key={r.name} className="rounded-3xl border border-line bg-bg p-7">
                <div className="flex gap-0.5 text-brass" aria-label={`Оценка ${r.rating ?? 5} из 5`}>
                  {Array.from({ length: r.rating ?? 5 }).map((_, i) => <Icon.star key={i} className="size-5 fill-current" />)}
                </div>
                <p className="mt-4">{r.text}</p>
                <p className="mt-4 font-bold">{r.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
