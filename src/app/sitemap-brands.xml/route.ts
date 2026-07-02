import { siteConfig } from "@/lib/siteConfig";
import { buildUrlsetXml, fetchBrands } from "@/lib/sitemap-data";

/** /sitemap-brands.xml — страницы брендов (route handler). */
export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteConfig.url;
  const now = new Date().toISOString();
  const brands = await fetchBrands();

  const entries = brands.map((b) => ({
    loc: `${base}/brand/${b.id}`,
    lastmod: now,
    changefreq: "weekly" as const,
    priority: 0.6,
  }));

  const xml = buildUrlsetXml(base, entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
