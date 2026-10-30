import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — АртВитраж",
  robots: { index: false },
};

// TODO: заполнить реквизиты оператора и согласовать текст с юристом.
export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-teal underline underline-offset-4">← На главную</Link>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Политика конфиденциальности</h1>
      <div className="mt-8 grid gap-6 leading-relaxed text-ink-soft">
        <p><b className="text-ink">Оператор персональных данных:</b> [TODO: наименование, ИНН, ОГРН, адрес].</p>
        <section><h2 className="text-xl font-bold text-ink">1. Какие данные мы собираем</h2><p className="mt-2">Имя, номер телефона, комментарий и фотографии объекта, которые вы указываете в форме заявки.</p></section>
        <section><h2 className="text-xl font-bold text-ink">2. Цели обработки</h2><p className="mt-2">Связаться с вами, проконсультировать, рассчитать стоимость и выполнить заказ.</p></section>
        <section><h2 className="text-xl font-bold text-ink">3. Передача третьим лицам</h2><p className="mt-2">Мы не передаём данные третьим лицам, кроме случаев, предусмотренных законом. [TODO: уточнить]</p></section>
        <section><h2 className="text-xl font-bold text-ink">4. Хранение и защита</h2><p className="mt-2">Данные хранятся не дольше, чем необходимо для целей обработки. [TODO: сроки и места хранения]</p></section>
        <section><h2 className="text-xl font-bold text-ink">5. Ваши права</h2><p className="mt-2">Вы вправе запросить уточнение, блокирование или удаление своих данных и отозвать согласие, написав нам на [TODO: e-mail].</p></section>
        <section><h2 className="text-xl font-bold text-ink">6. Файлы cookie и аналитика</h2><p className="mt-2">Сайт может использовать Яндекс.Метрику для статистики посещений.</p></section>
        <p className="text-sm">Шаблон подготовлен на основе требований Федерального закона № 152-ФЗ «О персональных данных». Перед публикацией проверьте текст у юриста.</p>
      </div>
    </main>
  );
}
