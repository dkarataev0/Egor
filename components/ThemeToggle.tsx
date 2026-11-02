"use client";
import { useEffect, useState } from "react";
import { Icon } from "./Icons";

// Переключатель светлой и тёмной темы. По умолчанию тёмная (фирменная); выбор хранится в localStorage.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.dataset.theme = next;
    window.setTimeout(() => root.classList.remove("theme-anim"), 500);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f6f3ec" : "#12181b");
    try { localStorage.setItem("theme", next); } catch { /* приватный режим */ }
    setTheme(next);
  }

  const light = theme === "light";
  return (
    <button
      onClick={toggle}
      aria-pressed={light}
      aria-label={light ? "Включить тёмную тему" : "Включить светлую тему"}
      title={light ? "Тёмная тема" : "Светлая тема"}
      className="grid size-11 place-items-center rounded-full transition hover:bg-white/10"
    >
      {light ? <Icon.moon className="size-5" /> : <Icon.sun className="size-5" />}
    </button>
  );
}
