/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Чистые хелперы для карточки товара.
 * Server-safe (нет window/localStorage/React) — используются и в серверном
 * page.tsx (для metadata), и в клиентском SinglePageClient.
 *
 * Дублируют логику из app/item/[id]/page.tsx (вынесены сюда при SSR-рефакторе).
 */

export const getStock = (product: any) =>
  Number(product?.inStock ?? product?.in_stock_count ?? 0);

export const getPrice = (product: any) =>
  Number(
    product?.price ?? product?.marketing_price ?? product?.retail_price ?? 0,
  );

export const getDiscountedPrice = (product: any) =>
  Number(
    product?.discountedPrice ?? product?.retail_price ?? product?.price ?? 0,
  );

export const getAvailabilityId = (product: any) => {
  if (product?.accessabilitySettingsID) {
    return Number(product.accessabilitySettingsID);
  }

  if (product?.availability === "needs_preorder") return 223;
  if (product?.availability === "always_available") return 224;

  return 222;
};

export const getSize = (product: any) => {
  const directSize =
    product?.shoeSizeName ??
    product?.size ??
    product?.productSize ??
    product?.sizeName;

  if (directSize) return String(directSize);

  const article = String(product?.article || "");

  if (article.includes("_")) {
    return article.split("_").pop();
  }

  return "";
};

export const getPrimaryPropertyLabel = (product: any) =>
  product?.primaryPropertyLabel ??
  product?.primary_property?.type?.name ??
  "Размер";

export const getPrimaryPropertyContext = (product: any) =>
  product?.primaryPropertyContext ?? product?.primary_property?.context ?? "";

export const getPrimaryPropertyContextValue = (product: any) =>
  product?.primaryPropertyContextValue ?? product?.primary_property?.value ?? "";

export const getPrimaryPropertyOptionValue = (product: any) => {
  const articleSize = getSize(product);
  if (articleSize) return articleSize;

  return String(product?.primary_property?.value ?? "");
};

export const formatPropertyContextValue = (context: any, value: any) => {
  if (!value) return "";

  return context?.toLowerCase().includes("стель")
    ? `${value} см`
    : String(value);
};

export const getArticleWithoutSize = (product: any) => {
  const article = String(product?.article || "");

  if (!article) return "";

  if (article.includes("_")) {
    return article.split("_").slice(0, -1).join("_");
  }

  return article;
};

export const getColorKey = (product: any) => {
  if (product?.color) return String(product.color);

  const secondaryId = product?.secondary_property?.id;
  if (secondaryId) return String(secondaryId);

  return getArticleWithoutSize(product);
};

export const getColorName = (product: any) => {
  if (product?.textColor) return product.textColor;

  const value = product?.secondary_property?.value;
  if (value) return value;

  const articleWithoutSize = getArticleWithoutSize(product);
  const parts = articleWithoutSize.split("-");

  return parts.length > 1 ? parts[parts.length - 1] : articleWithoutSize;
};

export const getSecondaryPropertyLabel = (product: any) =>
  product?.secondaryPropertyLabel ??
  product?.secondary_property?.type?.name ??
  "Цвет";

export const getSecondaryPropertyValue = (product: any) =>
  product?.secondaryPropertyValue ?? product?.secondary_property?.value ?? "";

export const getSecondaryPropertyDisplayValue = (product: any) => {
  const value = getSecondaryPropertyValue(product);
  if (value) return value;

  return product?.secondary_property ? "" : product?.textColor ?? "";
};

export const canBuyProduct = (product: any) => {
  const availabilityId = getAvailabilityId(product);

  if (availabilityId === 222) return getStock(product) > 0;
  if (availabilityId === 223) return true;
  if (availabilityId === 224) return true;

  return getStock(product) > 0;
};

/** Нормализация продукта под единый формат карточки. */
export const normalizeProduct = (product: any) => {
  const price = getPrice(product);
  const discountedPrice = getDiscountedPrice(product);
  const stock = getStock(product);
  const availabilityId = getAvailabilityId(product);
  const size = getSize(product);
  const colorKey = getColorKey(product);
  const colorName = getColorName(product);
  const primaryPropertyLabel = getPrimaryPropertyLabel(product);
  const primaryPropertyContext = getPrimaryPropertyContext(product);
  const primaryPropertyContextValue = getPrimaryPropertyContextValue(product);
  const secondaryPropertyLabel = getSecondaryPropertyLabel(product);
  const secondaryPropertyValue = getSecondaryPropertyValue(product);

  return {
    ...product,

    modelID: product?.modelID ?? product?.model_id,
    modelName: product?.modelName ?? product?.model_name,

    categoryID: product?.categoryID ?? product?.category?.id,
    categoryName: product?.categoryName ?? product?.category?.name,

    subCategoryID: product?.subCategoryID ?? product?.subcategory?.id,
    subCategoryName: product?.subCategoryName ?? product?.subcategory?.name,

    productTypeID: product?.productTypeID ?? product?.type?.id,
    productTypeName: product?.productTypeName ?? product?.type?.name,

    tradeMarkID: product?.tradeMarkID ?? product?.brand?.id,
    tradeMarkName: product?.tradeMarkName ?? product?.brand?.name,

    producingCountry:
      product?.producingCountry ?? product?.producing_country?.name,

    price,
    discountedPrice,
    inStock: stock,
    accessabilitySettingsID: availabilityId,

    packageSize: product?.packageSize ?? product?.package_size ?? 1,

    recomendedMinimalSize:
      product?.recomendedMinimalSize ??
      product?.recommended_order_quantity ??
      product?.minimum_order_quantity ??
      1,

    recomendedMinimalSizeEnabled:
      product?.recomendedMinimalSizeEnabled ??
      Number(product?.recommended_order_quantity ?? 1) > 1,

    prepayAmount: product?.prepayAmount ?? product?.prepay_amount,
    prepayPercent: product?.prepayPercent ?? product?.prepay_percent,

    preorderConditions: product?.preorderConditions ?? product?.terms_of_sell,
    storeDeliveryInDays: product?.storeDeliveryInDays ?? product?.delivery_time,

    shoeSizeName: size,
    shoeSizeLength: product?.shoeSizeLength ?? primaryPropertyContextValue,
    primaryPropertyLabel,
    primaryPropertyContext,
    primaryPropertyContextValue,
    secondaryPropertyLabel,
    secondaryPropertyValue,

    color: colorKey,
    textColor: colorName,

    attributes: product?.attributes || [],

    isNew: product?.isNew ?? (product?.is_new ? 1 : 0),

    WBURL: product?.WBURL ?? product?.wildberries_url,
    OzonURL: product?.OzonURL ?? product?.ozon_url,
    AvitoURL: product?.AvitoURL ?? product?.avito_url,
    YaMarketURL: product?.YaMarketURL ?? product?.yandex_market_url,

    WBAccessible: product?.WBAccessible ?? (product?.wildberries_url ? 1 : 0),
    OzonAccessible: product?.OzonAccessible ?? (product?.ozon_url ? 1 : 0),
    AvitoAccessible: product?.AvitoAccessible ?? (product?.avito_url ? 1 : 0),
    YaMarketAccessible:
      product?.YaMarketAccessible ?? (product?.yandex_market_url ? 1 : 0),
  };
};

/**
 * Из ответа API (массив / объект / обёртка {data}) получить массив продуктов.
 * Логика перенесена из исходного SinglePage useEffect 1:1.
 */
export const extractProducts = (response: any): any[] => {
  const payload = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  return payload ? [payload] : [];
};
