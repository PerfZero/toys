"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import formatNumber from "@/lib/utils";

/**
 * Бейдж «В корзине товаров на N ₽» на главной.
 * Клиентский — зависит от Redux cart (localStorage), поэтому не может рендериться
 * на сервере. Вынесен из старой клиентской Home в отдельный островок.
 */
export default function CartTotalBadge() {
  const [totalPrice, setTotalPrice] = useState(0);
  const cart = useSelector((state: any) => state.cart.items);

  useEffect(() => {
    const getRetailPrice = (product: any) =>
      Number(product?.retail_price ?? product?.discountedPrice ?? 0);

    const getMarketingPrice = (product: any) =>
      Number(product?.marketing_price ?? product?.price ?? 0);

    const getCurrentPrice = (product: any) => {
      const displayQuantity = Number(product.quantity);
      if (
        (displayQuantity >=
          Number(
            product?.recomendedMinimalSize ??
              product?.recommended_order_quantity ??
              Infinity,
          ) &&
          getRetailPrice(product)) ||
        product?.recomendedMinimalSizeEnabled === false ||
        Number(
          product?.recomendedMinimalSize ??
            product?.recommended_order_quantity ??
            1,
        ) <= 1
      ) {
        return getRetailPrice(product);
      }
      return getMarketingPrice(product);
    };

    const totalPrice = cart?.reduce((acc: number, product: any) => {
      const displayQuantity = Number(product.quantity);
      const availabilityId = Number(
        product?.accessabilitySettingsID ??
          (product?.availability === "needs_preorder"
            ? 223
            : product?.availability === "always_available"
              ? 224
              : 222),
      );
      const currentPrice =
        availabilityId === 223
          ? Number(product?.prepayAmount ?? product?.prepay_amount ?? 0)
          : getCurrentPrice(product);
      acc += displayQuantity * currentPrice;
      return acc;
    }, 0);
    setTotalPrice(parseInt(String(totalPrice)));
  }, [cart]);

  if (totalPrice <= 0) return null;

  return (
    <div className="go-to-order-wrap ">
      В корзине товаров на {formatNumber(totalPrice)} ₽
    </div>
  );
}
