import type { Metadata } from "next";
import { getNewProductsSSR } from "@/lib/ssr-api";
import ProductCardPreview from "@/components/catalog/ProductCardPreview";
import NewsClient from "@/components/categoryProducts/NewsClient";
import { siteConfig } from "@/lib/siteConfig";

// Свежие данные на каждый запрос (цены/наличие актуальны).
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Новинки — купить в Toymarket",
  description:
    "Новинки в интернет-магазине Toymarket: большой выбор, доставка по России, оплата онлайн.",
  alternates: { canonical: "/new" },
  openGraph: {
    type: "website",
    title: "Новинки — купить в Toymarket",
    description:
      "Новинки в интернет-магазине Toymarket: большой выбор, доставка по России, оплата онлайн.",
    url: `${siteConfig.url}/new`,
  },
};

export default async function NewProductsPage() {
  const products = await getNewProductsSSR(50);

  /**
   * Статичный SEO-блок: виден поисковикам без JS (заголовок «Новинки», описание,
   * список товаров). Дублирует ключевые данные, которые NewsClient рендерит
   * интерактивно — даёт краулерам реальный контент.
   * Скрыт визуально (screen-reader/SEO-friendly), т.к. поверх него — интерактив.
   */
  return (
    <>
      <section
        aria-label="Новинки"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}
      >
        <h1>Новинки</h1>
        <p>
          Новинки в интернет-магазине Toymarket: большой выбор, доставка по
          России, оплата онлайн.
        </p>
        {products.map((product: any) => (
          <ProductCardPreview key={product.id || product._id} product={product} />
        ))}
      </section>

      {/* Интерактивная сетка новинок (фильтры, сортировка, пагинация). */}
      <NewsClient initialProducts={products} />
    </>
  );
}
