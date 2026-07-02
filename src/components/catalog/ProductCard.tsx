/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useNavigate } from "@/hooks/navigation";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { decrementQuantity, incrementQuantity } from "@/store/slices/cartSlice";
import formatNumber from "@/lib/utils";
import noImg from "@/img/no_img.png";

export const getStock = (product: any) =>
  Number(product?.inStock ?? product?.in_stock_count ?? 0);

export const getModelId = (product: any) =>
  product?.modelID ?? product?.model_id ?? product?.modelId ?? "";

export const getArticle = (product: any) => String(product?.article || "");

export const getSize = (product: any) => {
  const directSize =
    product?.shoeSizeName ??
    product?.size ??
    product?.productSize ??
    product?.sizeName ??
    product?.shoeSize ??
    product?.clothesSize;

  if (directSize !== undefined && directSize !== null && directSize !== "") {
    return String(directSize);
  }

  const article = getArticle(product);

  if (article.includes("_")) {
    return article.split("_").pop();
  }

  const match = article.match(/(\d{2,3}(?:\.\d+)?)$/);

  return match?.[1] ?? "";
};

export const getPrimaryPropertyLabel = (product: any) =>
  product?.primaryPropertyLabel ?? product?.primary_property?.type?.name ?? "Размер";

export const getPrimaryPropertyContext = (product: any) =>
  product?.primaryPropertyContext ?? product?.primary_property?.context ?? "";

export const getPrimaryPropertyContextValue = (product: any) =>
  product?.primaryPropertyContextValue ?? product?.primary_property?.value ?? "";

export const getPrimaryPropertyOptionValue = (product: any) => {
  const articleSize = getSize(product);
  if (articleSize) return articleSize;

  return String(product?.primary_property?.value ?? "");
};

export const getSecondaryPropertyLabel = (product: any) =>
  product?.secondaryPropertyLabel ?? product?.secondary_property?.type?.name ?? "Цвет";

export const getSecondaryPropertyValue = (product: any) =>
  product?.secondaryPropertyValue ?? product?.secondary_property?.value ?? "";

export const getSecondaryPropertyDisplayValue = (product: any) => {
  const value = getSecondaryPropertyValue(product);
  if (value) return value;

  return product?.secondary_property ? "" : product?.textColor ?? "";
};

export const formatPropertyContextValue = (context: any, value: any) => {
  if (!value) return "";

  return context?.toLowerCase().includes("стель")
    ? `${value} см`
    : String(value);
};

export const getArticleWithoutSize = (product: any) => {
  const article = getArticle(product);

  if (!article) return "";

  if (article.includes("_")) {
    return article.split("_").slice(0, -1).join("_");
  }

  const size = getSize(product);

  if (size && article.endsWith(size)) {
    return article.slice(0, -size.length).replace(/[-_\s]+$/, "");
  }

  return article;
};

export const getSecondaryPropertyKey = (product: any) => {
  const secondaryId = product?.secondary_property?.id;
  if (secondaryId) return String(secondaryId);
  if (product?.color) return String(product.color);

  return getArticleWithoutSize(product);
};

export const getGroupKey = (product: any) => {
  const modelId = getModelId(product);
  const secondaryPropertyKey = getSecondaryPropertyKey(product);

  if (modelId && secondaryPropertyKey) return `${modelId}-${secondaryPropertyKey}`;
  if (modelId) return modelId;
  if (secondaryPropertyKey) return secondaryPropertyKey;

  return String(product?.id);
};

export const getRetailPrice = (product: any) =>
  Number(product?.retail_price ?? product?.price ?? 0);

export const getMarketingPrice = (product: any) =>
  Number(product?.marketing_price ?? 0);

export const getQuantitySteps = (product: any) =>
  Number(
    product?.recommended_order_quantity ??
      product?.quantitySteps ??
      product?.min_quantity ??
      product?.minQuantity ??
      0
  );

export const isRshzEnabled = (product: any) => {
  return Boolean(product.primary_price !== "retail");
};

export const getPrice = (product: any) => {
  const retailPrice = getRetailPrice(product);
  const marketingPrice = getMarketingPrice(product);

  if (isRshzEnabled(product)) {
    return marketingPrice || retailPrice;
  }

  return retailPrice;
};

export const getProductTypeId = (product: any) =>
  product?.productTypeID ?? product?.type_id ?? product?.typeId ?? product?.id;

export const getAvailabilityId = (product: any) => {
  if (product?.accessabilitySettingsID) {
    return Number(product.accessabilitySettingsID);
  }

  if (product?.availability === "needs_preorder") return 223;
  if (product?.availability === "always_available") return 224;

  return 222;
};

export const getPrepayPercent = (product: any) =>
  product?.prepayPercent ??
  product?.prepay_amount ??
  product?.prepay_percent ??
  0;

export const getIsNew = (product: any) =>
  product?.isNew === 1 || product?.is_new === true;

export const canBuyProduct = (product: any) => {
  const availabilityId = getAvailabilityId(product);

  if (availabilityId === 222) return getStock(product) > 0;
  if (availabilityId === 223) return true;
  if (availabilityId === 224) return true;

  return getStock(product) > 0;
};

export const canShowGroup = (products: any = []) =>
  products.some((product: any) => getPrice(product));

function ProductCard({ products = [] }: { products?: any[] }) {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const cartData = useSelector((state: any) => state.cart.items);

  const variants = useMemo(() => {
    const uniqueById = new Map();

    products.forEach((product: any) => {
      uniqueById.set(product.id, product);
    });

    return Array.from(uniqueById.values()).sort((a: any, b: any) => {
      const sizeA = Number(getPrimaryPropertyOptionValue(a));
      const sizeB = Number(getPrimaryPropertyOptionValue(b));

      if (Number.isNaN(sizeA) || Number.isNaN(sizeB)) {
        return String(getPrimaryPropertyOptionValue(a)).localeCompare(
          String(getPrimaryPropertyOptionValue(b))
        );
      }

      return sizeA - sizeB;
    });
  }, [products]);

  const cartVariant = useMemo(
    () =>
      variants.find((product: any) =>
        cartData.some((item: any) => item.id === product.id)
      ),
    [variants, cartData]
  );

  const firstAvailableVariant = useMemo(
    () => variants.find(canBuyProduct) || variants[0],
    [variants]
  );

  const [selectedProductId, setSelectedProductId] = useState<any>(null);

  useEffect(() => {
    if (cartVariant) {
      setSelectedProductId(cartVariant.id);
      return;
    }

    if (!selectedProductId && firstAvailableVariant?.id) {
      setSelectedProductId(firstAvailableVariant.id);
      return;
    }

    if (
      selectedProductId &&
      !variants.some((product: any) => product.id === selectedProductId)
    ) {
      setSelectedProductId(firstAvailableVariant?.id ?? null);
    }
  }, [cartVariant, firstAvailableVariant, selectedProductId, variants]);

  const product =
    variants.find((variant: any) => variant.id === selectedProductId) ??
    firstAvailableVariant;

  if (!product) return null;

  const inCart = cartData.find((item: any) => item.id === product.id);
  const displayQuantity = inCart?.quantity ?? 0;

  const retailPrice = getRetailPrice(product);
  const marketingPrice = getMarketingPrice(product);
  const quantitySteps = getQuantitySteps(product);
  const rshzEnabled = isRshzEnabled(product);

  const finalPrice = getPrice(product);
  const stock = getStock(product);
  const canBuySelectedProduct = canBuyProduct(product);

  if (!finalPrice) return null;

  const imageSrc = product?.id
    ? `https://api.toymarket.site/assets/products/${product.id}/image`
    : noImg.src;

  const handleIncrement = () => {
    if (!canBuySelectedProduct) return;

    dispatch(
      incrementQuantity({
        productId: product.id,
        inBox: product.inBox,
        inPackage: product.inPackage,
        inStock: stock,
        inTheBox: product.inTheBox,
      })
    );
  };

  const handleDecrement = () => {
    dispatch(
      decrementQuantity({
        productId: product.id,
        inBox: product.inBox,
        inPackage: product.inPackage,
        inTheBox: product.inTheBox,
      })
    );
  };

  if (!canShowGroup(variants)) return null;
  if (variants.length > 1 && !variants.some(canBuyProduct)) return null;

  return (
    <div className="catalogItem_card">
      <Link className="product-img-link" href={`/item/${getModelId(product) || product.id}`}>
        {rshzEnabled &&
        marketingPrice &&
        retailPrice &&
        marketingPrice < retailPrice ? (
          <div className="mark_discount">
            -{Math.round(((retailPrice - marketingPrice) / retailPrice) * 100)}%
          </div>
        ) : null}

        <img
          src={imageSrc}
          alt={product.article || product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = noImg.src;
          }}
          className="product-image"
        />

        {getIsNew(product) ? (
          <div className="mark_new_product">
            <span>Новинка</span>
          </div>
        ) : null}
      </Link>

      <p className="name">{product.name}</p>

      <div className="product-sizes">
        {variants.length > 1 &&
          variants.map((variant: any) => {
            const size = getPrimaryPropertyOptionValue(variant);
            const variantInCart = cartData.some(
              (item: any) => item.id === variant.id
            );
            const isSelected = variant.id === product.id;
            const isDisabled = !canBuyProduct(variant);

            if (!size) return null;

            return (
              <button
                key={variant.id}
                type="button"
                className={[
                  "product-size",
                  isSelected ? "active" : "",
                  variantInCart ? "in-cart" : "",
                  isDisabled ? "disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedProductId(variant.id)}
                title={`${getPrimaryPropertyLabel(variant)}: ${size}`}
              >
                {size}
              </button>
            );
          })}
      </div>

      <div>
        {stock > 0 ? <p className="weight">Осталось: {stock} шт</p> : null}

        {rshzEnabled && quantitySteps && retailPrice ? (
          <p className="weight">
            от {quantitySteps} шт по {formatNumber(retailPrice)} ₽
          </p>
        ) : null}
      </div>

      {canBuySelectedProduct ? (
        inCart ? (
          <div className="add catalog_counter">
            <FiMinus onClick={handleDecrement} />
            <p className="amount">{displayQuantity}</p>
            <FiPlus onClick={handleIncrement} />
          </div>
        ) : (
          <div
            className="price"
            onClick={() => nav.push(`/item/${getModelId(product) || product.id}`)}
          >
            {formatNumber(finalPrice)} ₽
          </div>
        )
      ) : (
        <div className="price notInStock">Нет в наличии</div>
      )}
    </div>
  );
}

export default ProductCard;
