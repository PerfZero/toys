import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/ssr-api";
import ProductCardPreview from "@/components/catalog/ProductCardPreview";
import CategoryProductsClient from "@/components/categoryProducts/CategoryProductsClient";
import { siteConfig } from "@/lib/siteConfig";

// Свежие данные на каждый запрос (цены/наличие актуальны).
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const products = await getProductsByCategory(id, 50);
  const categoryName =
    products[0]?.categoryName || products[0]?.category_name || "Каталог";
  const title = `${categoryName} — купить в Toymarket`;
  const description = `${categoryName}. Купить в интернет-магазине Toymarket: большой выбор, доставка по России, оплата онлайн.`;

  return {
    title,
    description,
    alternates: { canonical: `/cat/${id}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/cat/${id}`,
    },
  };
}

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProductsByCategory(id, 50);
  const categoryName =
    products[0]?.categoryName || products[0]?.category_name || "Каталог";

  /**
   * Статичный SEO-блок: виден поисковикам без JS (название категории, описание,
   * список товаров). Дублирует ключевые данные, которые CategoryProductsClient
   * рендерит интерактивно — даёт краулерам реальный контент.
   * Скрыт визуально (screen-reader/SEO-friendly), т.к. поверх него — интерактив.
   */
  return (
    <>
      <section
        aria-label={`Товары категории ${categoryName}`}
        style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}
      >
        <h1>{categoryName}</h1>
        <p>
          {categoryName}. Купить в интернет-магазине Toymarket: большой выбор,
          доставка по России, оплата онлайн.
        </p>
        {products.map((product: any) => (
          <ProductCardPreview key={product.id || product._id} product={product} />
        ))}
      </section>

      {/* Интерактивная сетка категории (фильтры, сортировка, пагинация). */}
      <CategoryProductsClient initialProducts={products} categoryId={id} />
    </>
  );
}
