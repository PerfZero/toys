/**
 * Server-side data access для SSR-страниц.
 *
 * Изолирован от lib/api.ts, который тянет axios + react-hot-toast (клиентские).
 * Здесь — только чистый fetch, безопасный для Server Components и generateMetadata.
 *
 * Политика кеширования: cache: 'no-store' — свежие данные (цены/наличие актуальны).
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

/** Продукт по id или model_id (карточка товара). */
export async function getProductById(id: string): Promise<Any | null> {
  try {
    const isNumeric = !isNaN(Number(id));
    const url = isNumeric
      ? `${API_URL}/products/${id}`
      : `${API_URL}/products/models/${id}`;
    const r = await fetch(url, NO_STORE);
    if (!r.ok) return null;
    const res = await r.json();
    // Может прийти массив (мульти-варианты модели) или одиночный объект.
    if (Array.isArray(res)) return res.length > 0 ? res : null;
    return res;
  } catch {
    return null;
  }
}

/** Товары по id категории (первые limit). */
export async function getProductsByCategory(
  categoryId: string,
  limit = 50,
): Promise<Any[]> {
  try {
    const r = await fetch(
      `${API_URL}/products?category_ids=${categoryId}&limit=${limit}`,
      NO_STORE,
    );
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
}

/** Новинки (первые limit). */
export async function getNewProductsSSR(limit = 20): Promise<Any[]> {
  try {
    const r = await fetch(`${API_URL}/products?is_new=true&limit=${limit}`, NO_STORE);
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
}

/** Все категории (для каталога на главной). */
export async function getCategoriesSSR(): Promise<Any[]> {
  try {
    const r = await fetch(`${API_URL}/products/categories`, {
      ...NO_STORE,
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
}

/** Товары по type_id (похожие/варианты для карточки). */
export async function getProductsByTypeSSR(
  typeId: string,
  limit = 20,
): Promise<Any[]> {
  try {
    const r = await fetch(
      `${API_URL}/products?type_ids=${typeId}&limit=${limit}`,
      NO_STORE,
    );
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
}

/** Товары по id подкатегории (первые limit). */
export async function getProductsBySubcategory(
  subcategoryId: string,
  limit = 50,
): Promise<Any[]> {
  try {
    const r = await fetch(
      `${API_URL}/products?subcategory_ids=${subcategoryId}&limit=${limit}`,
      NO_STORE,
    );
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
}

/** Товары по id бренда (первые limit). */
export async function getProductsByBrand(
  brandId: string,
  limit = 50,
): Promise<Any[]> {
  try {
    const r = await fetch(
      `${API_URL}/products?query=brand_id==${brandId}&limit=${limit}`,
      NO_STORE,
    );
    if (!r.ok) return [];
    return toArray(await r.json());
  } catch {
    return [];
  }
}

// ── Имена сущностей для generateMetadata (сырые продукты не содержат имён) ──

/** Имя бренда по id (из /products/brands). */
export async function getBrandName(brandId: string): Promise<string> {
  try {
    const r = await fetch(`${API_URL}/products/brands`, NO_STORE);
    if (!r.ok) return "";
    const brand = (await r.json()).find(
      (b: Any) => String(b.id) === String(brandId),
    );
    return brand?.name || "";
  } catch {
    return "";
  }
}

/**
 * Имя подкатегории или типа по id из дерева категорий.
 * kind: "subcat" | "type". Возвращает "" если не найдено.
 */
export async function getCategoryTreeNodeName(
  id: string,
  kind: "subcat" | "type",
): Promise<string> {
  try {
    const r = await fetch(`${API_URL}/products/categories`, {
      ...NO_STORE,
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return "";
    const categories = await r.json();

    for (const cat of categories) {
      for (const sub of cat.subcategories ?? []) {
        if (kind === "subcat" && String(sub.id) === String(id)) {
          return sub.name || "";
        }
        for (const type of sub.types ?? []) {
          if (kind === "type" && String(type.id) === String(id)) {
            return type.name || "";
          }
        }
      }
    }
    return "";
  } catch {
    return "";
  }
}
