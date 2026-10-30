"use client";
import { useState } from "react";
import company from "@/data/company.json";
import { Icon } from "./Icons";

// Плавающая кнопка «Позвонить / Написать» — только на мобильных.
export default function MobileFab() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 left-4 z-30 lg:hidden">
      {open && (
        <div className="glass mb-3 grid gap-1 rounded-2xl p-2">
          <a href={`tel:${company.phone}`} className="flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold">Позвонить</a>
          <a href={company.whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold">WhatsApp</a>
          <a href={company.telegram} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold">Telegram</a>
          {company.max && <a href={company.max} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold">MAX</a>}
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="btn btn-primary fab-pulse !px-5 shadow-xl">
        {open ? <Icon.close className="size-5" /> : <Icon.phone className="size-5" />}
        {open ? "Закрыть" : "Позвонить / Написать"}
      </button>
    </div>
  );
}
