import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "АртВитраж — стеклянные перила, душевые кабины и остекление в Краснодаре",
  description:
    "Стеклянные перила и ограждения, душевые кабины из стекла, окна и остекление в Краснодаре. Замер, проект, производство и монтаж. Рассчитайте стоимость онлайн.",
};

export const viewport: Viewport = {
  themeColor: "#f5f9f9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
