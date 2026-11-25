import type { Metadata } from "next";
import SpaceLogoPreview from "@/components/SpaceLogoPreview";

export const metadata: Metadata = {
  title: "Логотип «Свободное пространство» — превью анимации",
  robots: { index: false, follow: false },
};

export default function HeroLogoPage() {
  return <SpaceLogoPreview />;
}
