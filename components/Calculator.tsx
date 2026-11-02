"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import services from "@/data/services.json";
import calcData from "@/data/calculator.json";
import { compute, defaults, type ServiceCalc, type Values } from "@/lib/calc";
import { rub } from "./Services";
import { useLead } from "./LeadProvider";

const configs = calcData.services as unknown as Record<string, ServiceCalc>;
// Показываем только услуги, у которых есть настройки в calculator.json
const available = services.filter((s) => configs[s.id]);

const input =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-teal focus:ring-2 focus:ring-teal/25";

/** Плавный пересчёт числа при изменении параметров (мгновенно при reduced-motion). */
function useTween(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { from.current = target; setV(target); return; }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 500);
      const val = a + (target - a) * (1 - (1 - k) ** 3);
      from.current = val; setV(val);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return Math.round(v / 100) * 100;
}

export default function Calculator() {
  const { open } = useLead();
  const [id, setId] = useState(available[0]?.id ?? "");
  const [all, setAll] = useState<Record<string, Values>>(() =>
    Object.fromEntries(available.map((s) => [s.id, defaults(configs[s.id])])),
  );
  const cfg = configs[id];
  const values = all[id];
  const result = useMemo(() => (cfg ? compute(cfg, values) : null), [cfg, values]);
  const shownPrice = useTween(result?.price ?? 0);
  if (!cfg || !result) return null;

  const set = (fid: string, v: number | string | boolean) => setAll((a) => ({ ...a, [id]: { ...a[id], [fid]: v } }));
  const title = services.find((s) => s.id === id)!.title;

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="glass rounded-3xl p-5 sm:p-8">
        <div role="tablist" aria-label="Услуга для расчёта" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-4">
          {available.map((s) => (
            <button
              key={s.id} role="tab" aria-selected={s.id === id} onClick={() => setId(s.id)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${s.id === id ? "border-teal bg-teal text-white" : "border-line bg-white hover:border-teal"}`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {cfg.fields.map((f) => {
            const key = `${id}-${f.id}`;
            if (f.type === "number")
              return (
                <label key={key} htmlFor={key} className="grid gap-1.5 text-sm font-medium">
                  <span>{f.label}{f.unit && <span className="font-normal text-ink-soft"> ({f.unit})</span>}</span>
                  <input
                    id={key} className={input} type="number" inputMode="decimal" min={f.min} max={f.max} step={f.step ?? 0.1}
                    value={String(values[f.id])}
                    onChange={(e) => set(f.id, e.target.value === "" ? "" : Number(e.target.value))}
                    onBlur={(e) => { const n = Number(e.target.value); set(f.id, Number.isFinite(n) && e.target.value !== "" ? Math.min(f.max, Math.max(f.min, n)) : f.default); }}
                  />
                  <span className="text-xs font-normal text-ink-soft">от {f.min} до {f.max}</span>
                </label>
              );
            if (f.type === "select")
              return (
                <label key={key} htmlFor={key} className="grid gap-1.5 text-sm font-medium">
                  {f.label}
                  <select id={key} className={input} value={String(values[f.id])} onChange={(e) => set(f.id, e.target.value)}>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              );
            return (
              <label key={key} htmlFor={key} className="flex min-h-12 items-center gap-3 self-end text-sm font-medium">
                <input id={key} type="checkbox" className="size-5" checked={Boolean(values[f.id])} onChange={(e) => set(f.id, e.target.checked)} />
                {f.label}
              </label>
            );
          })}
        </div>
      </div>

      <aside className="glass self-start rounded-3xl p-6 sm:p-8 lg:sticky lg:top-24" aria-live="polite">
        <p className="text-sm text-ink-soft">{title}</p>
        <p className="mt-3 font-display text-4xl font-extrabold">от {rub(shownPrice)}</p>
        <p className="mt-1 text-sm text-ink-soft">Предварительный расчёт. Точную цену назовём после замера.</p>
        <dl className="mt-5 grid gap-1.5 border-t border-line pt-4 text-sm">
          {result.lines.map((l) => (
            <div key={l.label} className="flex justify-between gap-4"><dt className="text-ink-soft">{l.label}</dt><dd className="text-right font-medium">{l.value}</dd></div>
          ))}
        </dl>
        <button
          className="btn btn-primary mt-6 w-full"
          onClick={() => open({ serviceId: id, calc: { service: id, price: result.price, lines: result.lines } })}
        >
          Отправить расчёт менеджеру
        </button>
      </aside>
    </div>
  );
}
