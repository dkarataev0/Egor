import { useId } from "react";
import { LOGO_VIEWBOX, logoMarkup } from "./logo-markup";

// Логотип «АртВитраж» (слои из brand/logo/logo-layers.svg). Цвет текста и рамки берётся из currentColor.
export default function LogoSvg({ className = "", tagline = true, label }: { className?: string; tagline?: boolean; label?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      className={`lg ${tagline ? "" : "lg-notag"} ${className}`}
      viewBox={LOGO_VIEWBOX}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: logoMarkup(id) }}
    />
  );
}
