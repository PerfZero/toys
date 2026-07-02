/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import noImg from "@/img/no_img.png";

/**
 * Серверная статичная карточка товара для SEO.
 *
 * Рендерит <Link>, картинку, название, цену — чистый HTML без JS-интерактива.
 * Видна поисковикам (главная/категории отдают её серверно). Поверх неё в
 * клиентских островках работает интерактивный ProductCard (корзина, выбор варианта).
 *
 * Переиспользует логику helpers (не дублирует): формирует ссылку на /item/:modelId,
 * показывет скидку/новинку.
 */
export default function ProductCardPreview({ product }: { product: any }) {
  const retailPrice =
    Number(product?.retail_price ?? product?.price ?? 0) || 0;
  const marketingPrice =
    Number(product?.marketing_price ?? product?.discountedPrice ?? 0) || 0;
  const finalPrice = marketingPrice || retailPrice;

  if (!finalPrice) return null;

  const modelId = product?.model_id || product?.modelID || product?.id;
  const isNew = product?.is_new === true || product?.isNew === 1;
  const hasDiscount =
    retailPrice && marketingPrice && marketingPrice < retailPrice;
  const discountPercent = hasDiscount
    ? Math.round(((retailPrice - marketingPrice) / retailPrice) * 100)
    : 0;

  const imgSrc = product?.id
    ? `https://api.toymarket.site/assets/products/${product.id}/image`
    : noImg.src;

  return (
    <Link className="catalogItem_card" href={`/item/${modelId}`}>
      {hasDiscount && (
        <div className="mark_discount">-{discountPercent}%</div>
      )}
      {isNew && (
        <div className="mark_new_product">
          <span>Новинка</span>
        </div>
      )}
      <img
        src={imgSrc}
        alt={product.name || product.article || "Товар"}
        loading="lazy"
        className="product-image"
      />
      <p className="name">{product.name}</p>
      <div className="price">{finalPrice} ₽</div>
    </Link>
  );
}
