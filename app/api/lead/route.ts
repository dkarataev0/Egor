import { NextResponse } from "next/server";
import { leadSchema, MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/lead";
import { deliver } from "@/lib/notify";
import { rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const fail = (error: string, status: number, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fields }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return fail("Слишком много заявок. Попробуйте позже или позвоните нам.", 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Некорректный запрос", 400);
  }

  // Honeypot: настоящий пользователь это поле не видит и не заполняет. Боту отвечаем «успех».
  if (String(form.get("website") ?? "").trim() !== "") return NextResponse.json({ ok: true });

  const parsed = leadSchema.safeParse({
    name: form.get("name") ?? "",
    phone: form.get("phone") ?? "",
    service: form.get("service") ?? "",
    comment: form.get("comment") ?? "",
    consent: form.get("consent") ?? "",
    calc: form.get("calc") ?? "",
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
    return fail("Проверьте поля формы", 422, fields);
  }

  let photo = null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!PHOTO_TYPES.includes(file.type)) return fail("Фото: допустимы JPG, PNG и WebP", 422, { photo: "Допустимы JPG, PNG и WebP" });
    if (file.size > MAX_PHOTO_BYTES) return fail("Фото больше 5 МБ", 422, { photo: "Файл больше 5 МБ" });
    photo = { name: file.name.replace(/[^\w.\-]+/g, "_") || "photo", type: file.type, data: Buffer.from(await file.arrayBuffer()) };
  }

  const result = await deliver(parsed.data, photo);
  if (!result.configured) {
    console.warn("[lead] ни Telegram, ни e-mail не настроены. Заявка:", { ...parsed.data, comment: "…" });
    return fail("Приём заявок ещё не настроен. Позвоните нам или напишите в мессенджер.", 503);
  }
  if (!result.ok) return fail("Не удалось отправить заявку. Позвоните нам или напишите в мессенджер.", 502);
  return NextResponse.json({ ok: true });
}
