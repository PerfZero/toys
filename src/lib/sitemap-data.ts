/**
 * Общие функции получения данных для разбитого sitemap.
 * Используются route-хендлерами /sitemap-*.xml.
 * cache: no-store — свежие данные (товары/категории могут меняться).
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.toymarket.site";
const NO_STORE = { cache: "no-store" as const };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const toArray = (res: Any): Any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const fetchJson = async (path: string): Promise<Any[]> => {
  try {
    const r = await fetch(`${API_URL}${path}`, NO_STORE);
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
};

/** Товары пагинацией (бэкенд не отдаёт большие limit). */
export const fetchAllProducts = async (maxPages = 40): Promise<Any[]> => {
  const all: Any[] = [];
  for (let page = 0; page < maxPages; page++) {
    const batch = await fetchJson(`/products?limit=50&offset=${page * 50}`);
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 50) break;
  }
  return all;
};

export const fetchCategories = (): Promise<Any[]> => fetchJson("/products/categories");
export const fetchBrands = (): Promise<Any[]> => fetchJson("/products/brands");

/** XML-escape для значений в sitemap. */
export const xmlEscape = (s: string): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

/** Сборка urlset-XML из записей. */
export const buildUrlsetXml = (baseUrl: string, entries: UrlEntry[]): string => {
  const items = entries
    .map((e) => {
      const parts = [`    <loc>${xmlEscape(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority !== undefined)
        parts.push(`    <priority>${e.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;
};

/** Сборка sitemap-index XML из списка подтаблиц. */
export const buildSitemapIndexXml = (
  baseUrl: string,
  sitemaps: { loc: string; lastmod?: string }[],
): string => {
  const items = sitemaps
    .map((s) => {
      const parts = [`    <loc>${xmlEscape(s.loc)}</loc>`];
      if (s.lastmod) parts.push(`    <lastmod>${s.lastmod}</lastmod>`);
      return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
};
