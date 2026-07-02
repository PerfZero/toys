import { siteConfig } from "@/lib/siteConfig";
import { buildUrlsetXml } from "@/lib/sitemap-data";

/**
 * /sitemap-static.xml — статичные страницы (route handler).
 * Возвращает urlset ( НЕ индекс) с конкретными url-ами.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteConfig.url;
  const now = new Date().toISOString();

  const entries = [
    { loc: `${base}/`, lastmod: now, changefreq: "daily", priority: 1.0 },
    { loc: `${base}/new`, lastmod: now, changefreq: "daily", priority: 0.8 },
    { loc: `${base}/search`, lastmod: now, changefreq: "weekly", priority: 0.4 },
  ] as const;

  const xml = buildUrlsetXml(base, [...entries]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
