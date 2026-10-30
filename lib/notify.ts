import nodemailer from "nodemailer";
import { parseCalc, serviceTitle, type LeadInput } from "./lead";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rub = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

type Photo = { name: string; type: string; data: Buffer } | null;

function lines(lead: LeadInput) {
  const calc = parseCalc(lead.calc);
  const out = [
    ["Имя", lead.name],
    ["Телефон", lead.phone],
    ["Услуга", serviceTitle(lead.service || calc?.service || "")],
    ["Комментарий", lead.comment || "—"],
  ];
  if (calc?.lines?.length) {
    out.push(["Расчёт", calc.lines.map((l) => `${l.label}: ${l.value}`).join("; ")]);
    if (calc.price) out.push(["Предварительная стоимость", "от " + rub(calc.price)]);
  }
  return out as [string, string][];
}

export const channelsConfigured = () => ({
  telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  email: Boolean(process.env.MAIL_TO && process.env.SMTP_HOST),
});

async function telegram(lead: LeadInput, photo: Photo) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const api = process.env.TELEGRAM_API_URL || "https://api.telegram.org";
  const chat = process.env.TELEGRAM_CHAT_ID!;
  const text = "<b>Новая заявка с сайта</b>\n" + lines(lead).map(([k, v]) => `<b>${k}:</b> ${esc(v)}`).join("\n");
  const r = await fetch(`${api}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!r.ok) throw new Error(`telegram ${r.status}`);
  if (photo) {
    const fd = new FormData();
    fd.set("chat_id", chat);
    fd.set("photo", new Blob([new Uint8Array(photo.data)], { type: photo.type }), photo.name);
    const p = await fetch(`${api}/bot${token}/sendPhoto`, { method: "POST", body: fd });
    if (!p.ok) throw new Error(`telegram photo ${p.status}`);
  }
}

async function email(lead: LeadInput, photo: Photo) {
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  const rows = lines(lead);
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.MAIL_TO,
    subject: `Заявка с сайта: ${lead.name}, ${lead.phone}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: "<table>" + rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join("") + "</table>",
    attachments: photo ? [{ filename: photo.name, content: photo.data, contentType: photo.type }] : [],
  });
}

/** Отправляет во все настроенные каналы; успех, если сработал хотя бы один. */
export async function deliver(lead: LeadInput, photo: Photo) {
  const ch = channelsConfigured();
  const jobs: Promise<unknown>[] = [];
  if (ch.telegram) jobs.push(telegram(lead, photo));
  if (ch.email) jobs.push(email(lead, photo));
  if (!jobs.length) return { configured: false, ok: false };
  const res = await Promise.allSettled(jobs);
  res.forEach((r) => r.status === "rejected" && console.error("[lead] channel failed:", r.reason));
  return { configured: true, ok: res.some((r) => r.status === "fulfilled") };
}
