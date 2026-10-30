"use client";
// Каркас формы. Отправка, маска телефона и валидация подключаются на этапе 2.
import services from "@/data/services.json";

export default function LeadForm({
  serviceId, onDone,
}: { serviceId?: string; calc?: Record<string, unknown>; onDone?: () => void }) {
  const field = "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-teal focus:ring-2 focus:ring-teal/25";
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onDone?.(); }}>
      <label className="grid gap-1.5 text-sm font-medium">Имя
        <input className={field} name="name" autoComplete="name" required />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Телефон
        <input className={field} name="phone" type="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" required />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Услуга
        <select className={field} name="service" defaultValue={serviceId ?? ""}>
          <option value="">Не выбрана</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Комментарий
        <textarea className={field} name="comment" rows={3} />
      </label>
      <button className="btn btn-primary" type="submit">Отправить заявку</button>
    </form>
  );
}
