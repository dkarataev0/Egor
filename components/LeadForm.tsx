"use client";
import Link from "next/link";
import { useState } from "react";
import services from "@/data/services.json";
import company from "@/data/company.json";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { reachGoal } from "@/lib/analytics";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/lead";

type Props = { serviceId?: string; calc?: Record<string, unknown>; onDone?: () => void };
type Errors = Partial<Record<"name" | "phone" | "consent" | "photo", string>>;

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-teal focus:ring-2 focus:ring-teal/25 aria-[invalid=true]:border-red-600";

export default function LeadForm({ serviceId, calc, onDone }: Props) {
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Errors = {};
    if (String(fd.get("name")).trim().length < 2) next.name = "Укажите имя";
    if (!isValidPhone(phone)) next.phone = "Укажите телефон полностью";
    if (fd.get("consent") !== "true") next.consent = "Нужно согласие на обработку данных";
    const photo = fd.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (!PHOTO_TYPES.includes(photo.type)) next.photo = "Допустимы JPG, PNG и WebP";
      else if (photo.size > MAX_PHOTO_BYTES) next.photo = "Файл больше 5 МБ";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      (e.currentTarget.querySelector("[aria-invalid=true]") as HTMLElement | null)?.focus();
      return;
    }
    if (calc) fd.set("calc", JSON.stringify(calc));
    setState("sending");
    setServerError("");
    try {
      const r = await fetch("/api/lead", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        reachGoal("lead_submit");
        setState("done");
        return;
      }
      if (j.fields) setErrors(j.fields);
      setServerError(j.error || "Не удалось отправить заявку");
    } catch {
      setServerError("Нет связи с сервером. Проверьте интернет или позвоните нам.");
    }
    setState("idle");
  }

  if (state === "done") {
    return (
      <div role="status" className="py-6 text-center">
        <svg viewBox="0 0 52 52" className="mx-auto mb-4 size-16 text-teal" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle className="check-circle" cx="26" cy="26" r="23" />
          <path className="check-mark" d="M15 27l8 8 15-17" />
        </svg>
        <p className="font-display text-3xl font-extrabold">Спасибо!</p>
        <p className="mt-3 text-lg text-ink-soft">Перезвоним в течение 15 минут.</p>
        <p className="mt-1 text-sm text-ink-soft">В нерабочее время: {company.hours.toLowerCase()}, позвоним в начале рабочего дня.</p>
        {onDone && <button type="button" onClick={onDone} className="btn btn-primary mt-6">Закрыть</button>}
      </div>
    );
  }

  const err = (k: keyof Errors) => errors[k] && <span id={`err-${k}`} className="text-sm text-red-700">{errors[k]}</span>;
  const aria = (k: keyof Errors) => ({ "aria-invalid": Boolean(errors[k]), "aria-describedby": errors[k] ? `err-${k}` : undefined });

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate>
      {/* Honeypot: скрыто от людей и скринридеров, боты его заполняют */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Сайт<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium">Имя
        <input className={field} name="name" autoComplete="name" required {...aria("name")} />
        {err("name")}
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Телефон
        <input
          className={field} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__"
          value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} required {...aria("phone")}
        />
        {err("phone")}
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Услуга
        <select className={field} name="service" defaultValue={serviceId ?? ""}>
          <option value="">Не выбрана</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Комментарий
        <textarea className={field} name="comment" rows={3} maxLength={1500} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">Фото объекта <span className="font-normal text-ink-soft">(необязательно, до 5 МБ)</span>
        <input className={`${field} file:mr-3 file:rounded-full file:border-0 file:bg-teal-soft file:px-4 file:py-2 file:font-semibold file:text-teal-dark`} name="photo" type="file" accept="image/jpeg,image/png,image/webp" {...aria("photo")} />
        {err("photo")}
      </label>
      <div className="grid gap-1.5">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consent" value="true" className="mt-0.5 size-5 shrink-0" required {...aria("consent")} />
          <span>Согласен на обработку персональных данных в соответствии с <Link href="/privacy" target="_blank" className="text-teal-dark underline underline-offset-2">политикой конфиденциальности</Link></span>
        </label>
        {err("consent")}
      </div>

      {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{serverError} <a className="font-semibold underline" href={`tel:${company.phone}`}>{company.phoneDisplay}</a></p>}
      <button className="btn btn-primary" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}
