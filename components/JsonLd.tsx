import company from "@/data/company.json";
import services from "@/data/services.json";
import { DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Микроразметка LocalBusiness. Пустые поля в data/company.json в разметку не попадают.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    description: DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/og.jpg`,
    telephone: company.phone,
    ...(company.phones.length > 1 ? { contactPoint: company.phones.map((p) => ({ "@type": "ContactPoint", telephone: p.tel, contactType: "customer service", areaServed: "RU", availableLanguage: "ru" })) } : {}),
    ...(company.email ? { email: company.email } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: company.city,
      addressCountry: "RU",
      ...(company.address ? { streetAddress: company.address } : {}),
    },
    geo: { "@type": "GeoCoordinates", latitude: company.geo.lat, longitude: company.geo.lon },
    areaServed: { "@type": "City", name: company.city },
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      priceCurrency: "RUB",
      ...("priceFrom" in s && s.priceFrom ? { price: s.priceFrom } : {}),
      itemOffered: { "@type": "Service", name: s.title, description: s.description },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
