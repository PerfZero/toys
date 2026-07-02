import { siteConfig } from "@/lib/siteConfig";
import { buildSitemapIndexXml } from "@/lib/sitemap-data";

/**
 * /sitemap.xml — Sitemap INDEX (настоящий <sitemapindex>).
 *
 * Указывает на подтаблицы:
 *   /sitemap-static.xml     — статичные страницы
 *   /sitemap-categories.xml — категории, подкатегории, типы
 *   /sitemap-brands.xml     — бренды
 *   /sitemap-products.xml   — товары
 *
 * Каждая подтаблица — отдельный route handler, краулеры забирают их параллельно.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteConfig.url;
  const now = new Date().toISOString();

  const sitemaps = [
    `${base}/sitemap-static.xml`,
    `${base}/sitemap-categories.xml`,
    `${base}/sitemap-brands.xml`,
    `${base}/sitemap-products.xml`,
  ].map((loc) => ({ loc, lastmod: now }));

  const xml = buildSitemapIndexXml(base, sitemaps);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
