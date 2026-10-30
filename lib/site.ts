import company from "@/data/company.json";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://artvitrage.vercel.app").replace(/\/$/, "");
export const SITE_NAME = company.name;
export const TITLE = "АртВитраж — стеклянные перила, душевые кабины и остекление в Краснодаре";
export const DESCRIPTION =
  "Стеклянные перила и ограждения, душевые кабины из стекла, остекление и окна в Краснодаре. Замер, проект, производство и монтаж. Рассчитайте стоимость онлайн.";
export const KEYWORDS = ["стеклянные перила", "душевые кабины из стекла", "стеклянные ограждения", "остекление", "стеклянные изделия Краснодар"];
