"use client";
import { useId, type CSSProperties } from "react";
import { preload } from "react-dom";
import localFont from "next/font/local";
import "./SpaceLogo.css";

/*
  Анимированный логотип «Свободное пространство» для hero-блока.
  Сценарий и тайминги описаны в SpaceLogo.css; правки геометрии — в константах ниже.
  Скетч стадиона — растровый WebP (~35 КБ), проявляется SVG-маской из «мазков пера».
*/

// Сабсет Oswald 400 только с буквами логотипа (~1.2 КБ, OFL)
const logoFont = localFont({
  src: "./fonts/oswald-logo.woff2",
  weight: "400",
  display: "block",
  variable: "--sp-font",
  preload: true,
  fallback: ["Arial Narrow", "sans-serif"],
});

const SKETCH_SRC = "/images/hero/stadium-sketch.webp";

// Знак в координатах исходного макета (viewBox 500 274 104 292)
const DOORWAY = "M550.5 489.3V351.1L586.5 374.9V506.7";
const LEAF = "M588.3 332.3L515.5 283.9L516.5 553.9L555 520";

// Мазки маски для скетча (viewBox 0 0 1100 333): [path, ширина, задержка, длительность]
// Сначала линии крыш, затем конструкции, последними — широкие проходы штриховки.
const PENS: [string, number, number, number][] = [
  ["M128 170C150 95 215 30 330 12C395 4 440 28 466 58", 46, 2.0, 0.7],
  ["M285 212C350 120 440 30 545 12C640-2 790 40 862 155", 50, 2.1, 0.8],
  ["M190 182C230 92 290 26 345 15", 44, 2.25, 0.6],
  ["M455 212C560 150 670 80 765 58", 44, 2.45, 0.6],
  ["M300 205C500 215 700 190 860 160", 44, 2.55, 0.6],
  ["M22 205C55 150 110 138 150 168", 60, 2.6, 0.5],
  ["M18 242C300 252 700 292 1052 284", 70, 2.7, 0.7],
  ["M330 228C500 238 700 244 905 215", 70, 2.8, 0.6],
  ["M0 60H1100", 140, 3.0, 0.95],
  ["M0 170H1100", 140, 3.05, 0.95],
  ["M0 280H1100", 140, 3.1, 0.9],
];

const LINES: [string, number][] = [
  ["Свободное", 1.4],
  ["Пространство", 1.5],
];

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function SpaceLogo({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const maskId = `sp-mask-${uid}`;
  const softId = `sp-soft-${uid}`;
  preload(SKETCH_SRC, { as: "image", type: "image/webp", fetchPriority: "high" });

  return (
    <div
      className={`sp ${logoFont.variable} ${className}`}
      role="img"
      aria-label="Свободное пространство"
    >
      <div className="sp-stage" aria-hidden="true">
        <div className="sp-lockup">
          <div className="sp-mark">
            <svg className="sp-doorway" viewBox="500 274 104 292">
              <path pathLength={1} d={DOORWAY} />
            </svg>
            <svg className="sp-leaf" viewBox="500 274 104 292">
              <path pathLength={1} d={LEAF} />
            </svg>
          </div>
          <div className="sp-words">
            {LINES.map(([word, delay]) => (
              <span key={word} className="sp-line" style={{ "--d": `${delay}s` } as Vars}>
                <span className="sp-line-in">
                  {[...word].map((ch, i) => (
                    <span key={i} style={{ "--i": i } as Vars}>
                      {ch}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </div>
        </div>
        <svg className="sp-sketch" viewBox="0 0 1100 333">
          <defs>
            <filter id={softId} x="-5%" y="-10%" width="110%" height="120%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1100" height="333">
              <g filter={`url(#${softId})`}>
                {PENS.map(([d, w, delay, dur]) => (
                  <path
                    key={d}
                    className={w >= 140 ? "sp-pen sp-pen--fill" : "sp-pen"}
                    pathLength={1}
                    strokeWidth={w}
                    style={{ "--d": `${delay}s`, "--t": `${dur}s` } as Vars}
                    d={d}
                  />
                ))}
              </g>
            </mask>
          </defs>
          <image href={SKETCH_SRC} width="1100" height="333" mask={`url(#${maskId})`} />
        </svg>
      </div>
    </div>
  );
}
