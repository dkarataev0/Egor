import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import Calculator from "./Calculator";

export default function CalculatorSection() {
  return (
    <section id="calculator" className="bg-gradient-to-b from-teal-soft/70 to-bg py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionTitle className="max-w-2xl">Рассчитайте стоимость онлайн</SectionTitle>
        </Reveal>
        <Calculator />
      </div>
    </section>
  );
}
