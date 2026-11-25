"use client";
import { useState } from "react";
import SpaceLogo from "./SpaceLogo";

/** Превью анимации логотипа с кнопкой «Повторить» (перемонтирует компонент). */
export default function SpaceLogoPreview() {
  const [run, setRun] = useState(0);
  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#f7f7f5] px-4 py-12">
      <SpaceLogo key={run} />
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="fixed bottom-4 right-4 rounded-full border border-[#111] px-4 py-2.5 text-[13px] font-medium tracking-wide text-[#111] transition-colors hover:bg-[#111] hover:text-[#f7f7f5]"
      >
        Повторить
      </button>
    </main>
  );
}
