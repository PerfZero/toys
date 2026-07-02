/**
 * Центральный конфиг сайта — единый источник правды для SEO/metadata/sitemap.
 * Используется в app/layout.tsx, robots.ts, sitemap.ts.
 */

export const siteConfig = {
  /** Канонический домен (без завершающего слеша). */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://devdenis.ru",
  name: "Toymarket",
  shortName: "Toymarket",
  title: "Toymarket — интернет-магазин игрушек",
  description:
    "Toymarket — интернет-магазин игрушек: большой выбор, доставка по России, оплата онлайн. Закажите игрушки оптом и в розницу.",
  /** Локаль и язык. */
  locale: "ru_RU",
  lang: "ru",
  /** Контакты (для llms.txt / structured data). */
  supportPhone: "+79786121068",
  supportEmail: "support@spruton.shop",
  /** Соцсети/площадки. */
  telegramBot: "https://t.me/toymarket_bot",
} as const;

export type SiteConfig = typeof siteConfig;
