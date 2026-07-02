import { siteConfig } from "@/lib/siteConfig";
import { buildUrlsetXml, fetchCategories } from "@/lib/sitemap-data";

/** /sitemap-categories.xml — категории, подкатегории, типы (route handler). */
export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteConfig.url;
  const now = new Date().toISOString();
  const categories = await fetchCategories();

  const entries = [];

  for (const c of categories) {
    entries.push({
      loc: `${base}/cat/${c.id}`,
      lastmod: now,
      changefreq: "weekly" as const,
      priority: 0.7,
    });

    for (const s of c.subcategories ?? []) {
      entries.push({
        loc: `${base}/subcat/${s.id}`,
        lastmod: now,
        changefreq: "weekly" as const,
        priority: 0.6,
      });

      for (const t of s.types ?? []) {
        entries.push({
          loc: `${base}/type/${t.id}`,
          lastmod: now,
          changefreq: "weekly" as const,
          priority: 0.5,
        });
      }
    }
  }

  // Уникальные URL
  const seen = new Set<string>();
  const unique = entries.filter((e) => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });

  const xml = buildUrlsetXml(base, unique);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
