import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Metrika from "@/components/Metrika";
import JsonLd from "@/components/JsonLd";
import Intro from "@/components/Intro";
import { DESCRIPTION, KEYWORDS, SITE_NAME, SITE_URL, TITLE } from "@/lib/site";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "АртВитраж — изделия из стекла" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#12181b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}try{var d=document.documentElement;if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&(location.search.indexOf("intro")>-1||!sessionStorage.getItem("introSeen")))d.classList.add("intro-running")}catch(e){}` }} />
      </head>
      <body>
        <Intro />
        {children}
        <JsonLd />
        <Metrika />
      </body>
    </html>
  );
}
