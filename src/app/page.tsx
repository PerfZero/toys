"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Banner from "@/components/banner/Banner";
import Catalog from "@/components/catalog/Catalog";
import formatNumber from "@/lib/utils";
import "./home.css";

export default function Home() {
  const [totalPrice, setTotalPrice] = useState(0);
  const cart = useSelector((state: any) => state.cart.items);

  const getDisplayQuantity = (product: any) => {
    if (!product) return 0;
    return Number(product.quantity);
  };

  const getRetailPrice = (product: any) =>
    Number(product?.retail_price ?? product?.discountedPrice ?? 0);

  const getMarketingPrice = (product: any) =>
    Number(product?.marketing_price ?? product?.price ?? 0);

  const getCurrentPrice = (product: any) => {
    const displayQuantity = getDisplayQuantity(product);

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

  useEffect(() => {
    const totalPrice = cart?.reduce((acc: number, product: any) => {
      const displayQuantity = getDisplayQuantity(product);
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

  return (
    <div className="home">
      <Banner />
      <Catalog />
      {totalPrice > 0 && (
        <div className="go-to-order-wrap ">
          В корзине товаров на {formatNumber(totalPrice)} ₽
        </div>
      )}
    </div>
  );
}
