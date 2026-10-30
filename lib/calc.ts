/** Движок калькулятора. Формулы описываются данными в data/calculator.json. */
export type NumberField = { id: string; type: "number"; label: string; unit?: string; min: number; max: number; step?: number; default: number; role?: "length" | "width" | "height" };
export type SelectField = { id: string; type: "select"; label: string; default: string; options: { value: string; label: string; coef?: number; add?: number; addPerUnit?: number }[] };
export type CheckField = { id: string; type: "checkbox"; label: string; default: boolean; add?: number; addPerUnit?: number; coef?: number };
export type CalcField = NumberField | SelectField | CheckField;
export type ServiceCalc = { quantity: "length" | "area" | "count"; unit: string; basePrice: number; minPrice?: number; fields: CalcField[] };
export type Values = Record<string, number | string | boolean>;

export const defaults = (cfg: ServiceCalc): Values =>
  Object.fromEntries(cfg.fields.map((f) => [f.id, f.default]));

const num = (v: unknown, f: NumberField) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(f.max, Math.max(f.min, n)) : f.default;
};

/**
 * цена = basePrice × количество × Π коэффициентов
 *        + Σ (add + addPerUnit × количество)
 * количество: length (м), area (ширина или длина × высота, м²) или count.
 * Итог не ниже minPrice, округляется до 100 ₽.
 */
export function compute(cfg: ServiceCalc, values: Values) {
  const by = (role: string) => {
    const f = cfg.fields.find((x): x is NumberField => x.type === "number" && x.role === role);
    return f ? num(values[f.id], f) : undefined;
  };
  const length = by("length"), width = by("width"), height = by("height");
  const qty = cfg.quantity === "area" ? (width ?? length ?? 1) * (height ?? 1) : cfg.quantity === "length" ? length ?? 1 : 1;

  let coef = 1;
  let add = 0;
  const lines: { label: string; value: string }[] = [];
  for (const f of cfg.fields) {
    const v = values[f.id] ?? f.default;
    if (f.type === "number") {
      const n = num(v, f);
      lines.push({ label: f.label, value: `${n} ${f.unit ?? ""}`.trim() });
    } else if (f.type === "select") {
      const o = f.options.find((x) => x.value === v) ?? f.options[0];
      coef *= o.coef ?? 1;
      add += (o.add ?? 0) + (o.addPerUnit ?? 0) * qty;
      lines.push({ label: f.label, value: o.label });
    } else {
      const on = Boolean(v);
      if (on) { coef *= f.coef ?? 1; add += (f.add ?? 0) + (f.addPerUnit ?? 0) * qty; }
      lines.push({ label: f.label, value: on ? "Да" : "Нет" });
    }
  }
  const raw = cfg.basePrice * qty * coef + add;
  const price = Math.round(Math.max(cfg.minPrice ?? 0, raw) / 100) * 100;
  return { price, qty: Math.round(qty * 100) / 100, lines };
}
