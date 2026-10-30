import { z } from "zod";
import services from "@/data/services.json";
import { isValidPhone } from "./phone";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const serviceIds = services.map((s) => s.id);

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80, "Слишком длинное имя"),
  phone: z.string().refine(isValidPhone, "Укажите телефон полностью"),
  service: z.string().refine((v) => v === "" || serviceIds.includes(v), "Выберите услугу из списка"),
  comment: z.string().trim().max(1500, "Не более 1500 символов").default(""),
  consent: z.literal("true", { message: "Нужно согласие на обработку данных" }),
  calc: z.string().max(4000).default(""),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type CalcPayload = { service?: string; price?: number; lines?: { label: string; value: string }[] };

export function parseCalc(raw: string): CalcPayload | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? (v as CalcPayload) : null;
  } catch {
    return null;
  }
}

export const serviceTitle = (id: string) => services.find((s) => s.id === id)?.title ?? "Не выбрана";
