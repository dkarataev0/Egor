// Лимит запросов по IP в памяти процесса: 5 заявок за 10 минут.
// Для нескольких инстансов замените на Upstash/Redis (см. README).
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 5;
const hits = new Map<string, number[]>();

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > MAX;
}
