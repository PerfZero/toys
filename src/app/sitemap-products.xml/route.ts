import { siteConfig } from "@/lib/siteConfig";
import { buildUrlsetXml, fetchAllProducts } from "@/lib/sitemap-data";

/** /sitemap-products.xml — карточки товаров (route handler). */
export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteConfig.url;
  const now = new Date().toISOString();
  const products = await fetchAllProducts();

  // Мульти-варианты модели схлопываем в один URL по model_id.
  const seenModel = new Set<string>();
  const entries = [];

  for (const p of products) {
    const model = p.model_id || p.modelID || p.id;
    if (!model || seenModel.has(String(model))) continue;
    seenModel.add(String(model));
    entries.push({
      loc: `${base}/item/${model}`,
      lastmod: now,
      changefreq: "weekly" as const,
      priority: 0.9,
    });
  }

  const xml = buildUrlsetXml(base, entries);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
