"use client";
import { useEffect, useRef } from "react";

// Золотая «пыль» в лучах света: лёгкий canvas, паузится вне экрана и при reduced-motion не рисуется.
export default function HeroParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = window.innerWidth < 640 ? 18 : 42;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8,
      v: 0.012 + Math.random() * 0.03, s: Math.random() * Math.PI * 2, a: 0.25 + Math.random() * 0.5,
    }));

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      raf = 0;
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= d.v * 0.016;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        const x = (d.x + Math.sin(t / 2600 + d.s) * 0.012) * w;
        const tw = 0.55 + 0.45 * Math.sin(t / 900 + d.s * 3);
        ctx.beginPath();
        ctx.fillStyle = `rgba(227, 198, 136, ${(d.a * tw).toFixed(3)})`;
        ctx.arc(x, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    resize();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => { io.disconnect(); window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full" />;
}
