"use client";
import { useEffect, useRef, useState } from "react";

// Фоновое видео hero. Грузится после загрузки страницы и только на широких экранах,
// без reduced-motion и без режима экономии трафика. Пока видео не готово, виден постер (фото).
export default function HeroVideo({ src }: { src: string }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const ok =
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !conn?.saveData;
    if (!ok) return;
    const go = () => setEnabled(true);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  if (!enabled) return null;
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      onCanPlay={() => setReady(true)}
      className="absolute inset-0 size-full object-cover transition-opacity duration-1000"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
