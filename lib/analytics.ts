declare global {
  interface Window { ym?: (id: number, method: string, goal?: string) => void }
}

/** Цель Яндекс.Метрики. Ничего не делает, пока не задан NEXT_PUBLIC_YM_ID. */
export function reachGoal(goal: string) {
  const id = Number(process.env.NEXT_PUBLIC_YM_ID);
  if (id && typeof window !== "undefined") window.ym?.(id, "reachGoal", goal);
}
