"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import LeadForm from "./LeadForm";
import { Icon } from "./Icons";

export type LeadOptions = { serviceId?: string; calc?: Record<string, unknown> };
type Ctx = { open: (opts?: LeadOptions) => void };
const LeadCtx = createContext<Ctx>({ open: () => {} });
export const useLead = () => useContext(LeadCtx);

export default function LeadProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<LeadOptions | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((o: LeadOptions = {}) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setOpts(o);
  }, []);
  const close = useCallback(() => setOpts(null), []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (opts && !d.open) {
      d.showModal();
      document.body.style.overflow = "hidden";
    }
    if (!opts && d.open) {
      d.close();
      document.body.style.overflow = "";
      lastFocus.current?.focus();
    }
  }, [opts]);

  return (
    <LeadCtx.Provider value={{ open }}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-labelledby="lead-title"
        className="m-auto w-[min(32rem,calc(100vw-1.5rem))] max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-scrim/55 backdrop:backdrop-blur-sm"
      >
        {opts && (
          <div className="relative p-6 sm:p-8">
            <button onClick={close} aria-label="Закрыть форму" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full hover:bg-teal-soft">
              <Icon.close className="size-5" />
            </button>
            <h2 id="lead-title" className="pr-10 text-2xl font-extrabold">Оставить заявку</h2>
            <p className="mb-5 mt-1 text-sm text-ink-soft">Перезвоним в течение 15 минут в рабочее время.</p>
            <LeadForm serviceId={opts.serviceId} calc={opts.calc} onDone={close} />
          </div>
        )}
      </dialog>
    </LeadCtx.Provider>
  );
}
