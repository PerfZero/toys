import type { Metadata } from "next";
import { getProductsByBrand, getBrandName } from "@/lib/ssr-api";
import ProductCardPreview from "@/components/catalog/ProductCardPreview";
import BrandProductsClient from "@/components/categoryProducts/BrandProductsClient";
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
  // Имя тянем из /products/brands — сырые продукты его не содержат.
  const name = (await getBrandName(id)) || "Товары";
  const title = `${name} — купить в Toymarket`;
  const description = `${name}. Купить в интернет-магазине Toymarket: большой выбор, доставка по России, оплата онлайн.`;

  return {
    title,
    description,
    alternates: { canonical: `/brand/${id}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/brand/${id}`,
    },
  };
}

export default async function BrandProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [products, name] = await Promise.all([
    getProductsByBrand(id, 50),
    getBrandName(id),
  ]);
  const displayName = name || "Товары";

  /**
   * Статичный SEO-блок: виден поисковикам без JS (название бренда, описание,
   * список товаров). Дублирует ключевые данные, которые BrandProductsClient
   * рендерит интерактивно — даёт краулерам реальный контент.
   * Скрыт визуально (screen-reader/SEO-friendly), т.к. поверх него — интерактив.
   */
  return (
    <>
      <section
        aria-label={`Товары бренда ${displayName}`}
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <h1>{displayName}</h1>
        <p>
          {displayName}. Купить в интернет-магазине Toymarket: большой выбор,
          доставка по России, оплата онлайн.
        </p>
        {products.map((product: any) => (
          <ProductCardPreview
            key={product.id || product._id}
            product={product}
          />
        ))}
      </section>

      {/* Интерактивная сетка бренда (фильтры, сортировка, пагинация). */}
      <BrandProductsClient initialProducts={products} id={id} />
    </>
  );
}
