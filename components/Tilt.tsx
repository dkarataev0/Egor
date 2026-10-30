"use client";
import { useRef, useState } from "react";

// Наклон карточки за курсором и блик. Только для мыши; на тач-экранах не срабатывает.
export default function Tilt({ children, className = "", max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    setActive(true);
  };
  const leave = () => {
    const el = ref.current;
    el?.style.setProperty("--rx", "0deg");
    el?.style.setProperty("--ry", "0deg");
    setActive(false);
  };

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} data-active={active} className={`tilt relative ${className}`}>
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}
