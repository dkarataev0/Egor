"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

const KEY = "bg-music";
const SRC = "/audio/bg.mp3";
const VOLUME = 0.2;
const FADE_IN_MS = 2000;
const FADE_OUT_MS = 400;

const isMobile = () => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v: "on" | "off") => { try { localStorage.setItem(KEY, v); } catch { /* приватный режим */ } };

export default function MusicToggle() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  const wanted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const fade = useCallback((to: number, ms: number, done?: () => void) => {
    cancelAnimationFrame(raf.current);
    const a = audio.current;
    if (!a) return;
    const from = a.volume, t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k < 1) raf.current = requestAnimationFrame(step);
      else done?.();
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  /** Возвращает true, если воспроизведение началось (браузер мог отклонить автозапуск). */
  const start = useCallback(async () => {
    if (!audio.current) {
      const a = new Audio(); // файл грузится только здесь, при первом запуске
      a.src = SRC; a.loop = true; a.volume = 0; a.preload = "auto";
      audio.current = a;
    }
    try {
      await audio.current.play();
    } catch {
      return false;
    }
    setPlaying(true);
    fade(VOLUME, FADE_IN_MS);
    return true;
  }, [fade]);

  const stop = useCallback(() => {
    fade(0, FADE_OUT_MS, () => audio.current?.pause());
    setPlaying(false);
  }, [fade]);

  // Начальное состояние: сохранённый выбор, иначе вкл. на десктопе и выкл. на мобильных
  useEffect(() => {
    const saved = read();
    const on = saved ? saved === "on" : !isMobile();
    wanted.current = on;
    setEnabled(on);
    if (!on) return;

    // Автозапуск со звуком запрещён: ждём первый клик, нажатие или скролл. Скролл не всегда считается жестом, тогда ждём дальше.
    const events = ["pointerdown", "keydown", "touchend", "wheel", "scroll"] as const;
    const off = () => events.forEach((e) => window.removeEventListener(e, kick));
    async function kick() {
      if (!wanted.current) return off();
      if (await start()) off();
    }
    events.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    return off;
  }, [start]);

  // Пауза, когда вкладка скрыта
  useEffect(() => {
    const on = () => {
      const a = audio.current;
      if (!a || !wanted.current) return;
      if (document.hidden) a.pause();
      else void a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  useEffect(() => () => { cancelAnimationFrame(raf.current); audio.current?.pause(); }, []);

  async function toggle() {
    if (playing) {
      wanted.current = false; setEnabled(false); write("off"); stop();
    } else {
      wanted.current = true; setEnabled(true); write("on");
      await start();
    }
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Выключить фоновую музыку" : "Включить фоновую музыку"}
      title={playing ? "Выключить музыку" : "Включить музыку"}
      className="glass fixed bottom-4 right-4 z-30 grid size-12 place-items-center rounded-full text-teal-dark transition hover:scale-105"
      data-enabled={enabled}
    >
      {playing ? (
        <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="eq-bar w-[3px] origin-bottom rounded-full bg-teal" style={{ height: "100%", animationDelay: `${i * 0.18}s` }} />
          ))}
        </span>
      ) : (
        <span className="relative" aria-hidden="true">
          <Icon.note className="size-5" />
          <span className="absolute left-1/2 top-1/2 h-0.5 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded bg-ink-soft" />
        </span>
      )}
    </button>
  );
}
