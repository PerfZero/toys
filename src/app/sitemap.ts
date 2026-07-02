import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { API_URL } from "@/lib/api";

/**
 * sitemap.xml — генерируется Next.js на /sitemap.xml.
 *
 * Включает статичные страницы + динамические категории/подкатегории/бренды/
 * товары из бэкенда. Серверный route — исполняется по запросу поисковика.
 * Если бэкенд недоступен — отдаём только статичные страницы (не падаем).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchJson = async (path: string): Promise<any[]> => {
  try {
    const r = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      // Кэш на 1 час — каталог меняется, но не каждую минуту.
      next: { revalidate: 3600 },
    });
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
};

/** Товары пагинацией: бэкенд не отдаёт большие limit, тянем постранично. */
const fetchAllProducts = async (maxPages = 40): Promise<any[]> => {
  const all: any[] = [];
  for (let page = 0; page < maxPages; page++) {
    const batch = await fetchJson(`/products?limit=50&offset=${page * 50}`);
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 50) break; // последняя страница
  }
  return all;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  // 1. Статичные страницы.
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/new`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
  ];

  // 2. Категории, подкатегории, бренды, товары — параллельно, устойчиво к ошибкам.
  const [categories, brands, products] = await Promise.all([
    fetchJson("/products/categories"),
    fetchJson("/products/brands"),
    fetchAllProducts(),
  ]);

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c: any) => ({
    url: `${base}/cat/${c.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const subcatEntries: MetadataRoute.Sitemap = categories.flatMap((c: any) =>
    (c.subcategories ?? []).map((s: any) => ({
      url: `${base}/subcat/${s.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  );

  const brandEntries: MetadataRoute.Sitemap = brands.map((b: any) => ({
    url: `${base}/brand/${b.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Товары — по model_id (мультикарточки схлопываются в одну страницу /item/:modelId).
  const seenModel = new Set<string>();
  const productEntries: MetadataRoute.Sitemap = [];
  for (const p of products) {
    const model = p.model_id || p.modelID || p.id;
    if (!model || seenModel.has(String(model))) continue;
    seenModel.add(String(model));
    productEntries.push({
      url: `${base}/item/${model}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // Уникальные URL на всякий случай.
  const seen = new Set<string>();
  return [
    ...staticEntries,
    ...categoryEntries,
    ...subcatEntries,
    ...brandEntries,
    ...productEntries,
  ].filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
