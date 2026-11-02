"use client";
import { useEffect, useRef, useState } from "react";

// Заголовок секции: текст выезжает из-под маски, когда секция появляется на экране.
export default function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <h2 ref={ref} className={`section-title ${className}`}>
      <span className="title-mask"><span className="title-inner" data-in={shown}>{children}</span></span>
    </h2>
  );
}
