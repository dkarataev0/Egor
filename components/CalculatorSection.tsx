import Reveal from "./Reveal";

// Каркас. Полноценный калькулятор — на этапе 3.
export default function CalculatorSection() {
  return (
    <section id="calculator" className="bg-gradient-to-b from-teal-soft/70 to-bg py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="eyebrow">Калькулятор</p>
          <h2 className="section-title mt-3 max-w-2xl">Рассчитайте стоимость онлайн</h2>
        </Reveal>
        <div className="glass mt-10 rounded-3xl p-8 text-ink-soft">Калькулятор подключается на этапе 3.</div>
      </div>
    </section>
  );
}
