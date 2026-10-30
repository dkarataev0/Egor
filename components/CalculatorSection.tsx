import Reveal from "./Reveal";
import Calculator from "./Calculator";

export default function CalculatorSection() {
  return (
    <section id="calculator" className="bg-gradient-to-b from-teal-soft/70 to-bg py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <h2 className="section-title max-w-2xl">Рассчитайте стоимость онлайн</h2>
        </Reveal>
        <Calculator />
      </div>
    </section>
  );
}
