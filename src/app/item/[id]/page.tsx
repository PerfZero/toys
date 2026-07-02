import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/ssr-api";
import {
  extractProducts,
  normalizeProduct,
  getPrice,
  getDiscountedPrice,
  getStock,
  getAvailabilityId,
} from "@/components/singlepage/helpers";
import SinglePageClient from "@/components/singlepage/SinglePageClient";
import { siteConfig } from "@/lib/siteConfig";
import "@/components/singlepage/SinglePage.css";

// Свежие данные на каждый запрос (цены/наличие актуальны).
export const revalidate = 0;
export const dynamic = "force-dynamic";

/** Очистка HTML из описания для meta description (поисковики). */
const stripHtml = (html: string): string =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-zA-Z#0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const response = await getProductById(id);
  if (!response) return {};

  const products = extractProducts(response).map(normalizeProduct);
  const product =
    products.find((p: any) => Number(p.id) === Number(id)) ||
    products.find((p: any) => getStock(p) > 0) ||
    products[0];

  if (!product) return {};

  const price = getPrice(product) || getDiscountedPrice(product);
  const availabilityId = getAvailabilityId(product);
  const inStock = getStock(product);
  const availability =
    availabilityId === 224 || availabilityId === 223 || inStock > 0
      ? "instock"
      : "oos";
  const description =
    stripHtml(product.description) ||
    `${product.name}. Купить в интернет-магазине Toymarket.`;
  const title = product.name
    ? `${product.name} — купить в Toymarket`
    : siteConfig.title;

  return {
    title,
    description,
    alternates: { canonical: `/item/${id}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/item/${id}`,
      images: [
        {
          url: `https://api.toymarket.site/assets/products/${product.id}/image`,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://api.toymarket.site/assets/products/${product.id}/image`],
    },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "RUB",
      "product:availability": availability,
      "product:brand": product.tradeMarkName || "",
    },
  };
}

export default async function SinglePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getProductById(id);

  if (!response) {
    notFound();
  }

  const products = extractProducts(response).map(normalizeProduct);

  if (products.length === 0) {
    notFound();
  }

  const product =
    products.find((p: any) => Number(p.id) === Number(id)) ||
    products.find((p: any) => getStock(p) > 0) ||
    products[0];

  const price = getPrice(product) || getDiscountedPrice(product);
  const inStock = getStock(product);

  /**
   * Статичный SEO-блок: виден поисковикам без JS (название, цена, наличие,
   * картинка, описание, характеристики). Дублирует ключевые данные, которые
   * SinglePageClient рендерит интерактивно — даёт краулерам реальный контент.
   * Скрыт визуально (screen-reader/SEO-friendly), т.к. поверх него — интерактив.
   */
  return (
    <>
      <section
        aria-label="Информация о товаре"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}
      >
        <h1>{product.name}</h1>
        <p>
          Цена: {price} ₽. {inStock > 0 ? `В наличии: ${inStock} шт.` : "Нет в наличии"}
          {product.tradeMarkName ? `. Бренд: ${product.tradeMarkName}` : ""}
          {product.article ? `. Артикул: ${product.article}` : ""}.
        </p>
        <img
          src={`https://api.toymarket.site/assets/products/${product.id}/image`}
          alt={product.name}
          width={200}
          height={200}
        />
        {product.description ? (
          <div>{stripHtml(product.description)}</div>
        ) : null}
        {/* Категории для SEO-перелинковки */}
        {product.categoryID ? (
          <Link href={`/cat/${product.categoryID}`}>{product.categoryName}</Link>
        ) : null}
        {product.subCategoryID ? (
          <Link href={`/subcat/${product.subCategoryID}`}>
            {product.subCategoryName}
          </Link>
        ) : null}
        {product.tradeMarkID ? (
          <Link href={`/brand/${product.tradeMarkID}`}>{product.tradeMarkName}</Link>
        ) : null}
      </section>

      {/* Интерактивная карточка (выбор размера/цвета, корзина, табы). */}
      <SinglePageClient products={products} />
    </>
  );
}
