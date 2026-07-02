import axios, { AxiosInstance } from "axios";
import toast from "react-hot-toast";

/**
 * Базовый URL бэкенда Toymarket.
 * Берётся из NEXT_PUBLIC_API_URL (по умолчанию прод-инстанс).
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.toymarket.site";

/** axios-инстанс с cookie-авторизацией (withCredentials). */
export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/`,
  withCredentials: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const getProducts = async (): Promise<Any> => {
  const req = await fetch(`${API_URL}/products`);
  const res = await req.json();
  return Array.isArray(res) ? res : res?.data ?? res;
};

const getProductsByType = async (id: string | number): Promise<Any> => {
  const req = await fetch(`${API_URL}/products?type_ids=${id}`);
  const res = await req.json();
  return Array.isArray(res) ? res : res?.data ?? res;
};

const getProductsById = async (id: string | number): Promise<Any> => {
  try {
    const isNumeric = !isNaN(Number(id));
    const url = isNumeric
      ? `${API_URL}/products/${id}`
      : `${API_URL}/products/models/${id}`;
    const req = await fetch(url);
    const res = await req.json();
    return res;
  } catch {
    return null;
  }
};

const getProductsByTypeWithLimit = async (
  id: string | number,
  limit?: number,
): Promise<Any> => {
  const req = await fetch(
    `${API_URL}/products?category_ids=${id}${limit ? `&limit=${limit}` : ""}`,
  );
  const res = await req.json();
  return Array.isArray(res) ? res : res?.data ?? res;
};

const getNewProducts = async (limit: number): Promise<Any> => {
  const req = await fetch(
    `${API_URL}/products?is_new=true&limit=${limit}`,
  );
  const res = await req.json();
  return Array.isArray(res) ? res : res?.data ?? res;
};

const getProductsBySearch = async (value: string): Promise<Any> => {
  const query = value ? `'"${value}"'` : "";
  const req = await fetch(`${API_URL}/products?query=${encodeURIComponent(query)}`);
  const res = await req.json();
  return Array.isArray(res) ? res : res?.data ?? res;
};

const getUser = async (): Promise<Any> => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const req = await fetch(`${API_URL}/auth/me/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "WebApp",
      },
      body: JSON.stringify({ tgUserData: user }),
    });
    const res = await req.json();
    return res.data;
  } catch {
    toast.error("Не удалось войти в систему, попробуйте снова.");
    localStorage.removeItem("user");
    return null;
  }
};

const newOrder = async (data: Record<string, unknown>): Promise<Any> => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const req = await fetch(`${API_URL}/order/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: "WebApp",
    },
    body: JSON.stringify({ tgUserData: user, ...data }),
  });
  const res = await req.json();
  return res;
};

const payTBank = async (orderID: string | number): Promise<Any> => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const req = await fetch(`${API_URL}/payment/tbank/init/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: "WebApp",
    },
    body: JSON.stringify({ tgUserData: user, orderID }),
  });
  const res = await req.json();
  return res;
};

const getSingleProduct = async (id: string | number): Promise<Any> => {
  const req = await fetch(`${API_URL}/product?id=${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const res = await req.json();
  const data = Array.isArray(res) ? res : res?.data ?? res;
  return Array.isArray(data) ? data[0] : data;
};

const getCategories = async (): Promise<Any> => {
  const req = await fetch(`${API_URL}/products/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: "WebApp",
    },
  });
  const res = await req.json();
  return Array.isArray(res) ? res : res?.data ?? res;
};

/**
 * Авторизация. В Telegram Mini App — через initData,
 * в обычном браузере — через данные виджета Telegram Login.
 */
export const getToken = async (): Promise<Any> => {
  try {
    // В Telegram Mini App — через initData
    const tgInitData =
      typeof window !== "undefined" && window.Telegram?.WebApp?.initData;
    if (tgInitData) {
      const response = await axios.post(
        `${API_URL}/auth/login/telegram/miniapp`,
        { data: tgInitData },
        { withCredentials: true },
      );
      return response.data;
    }

    // В браузере — через данные виджета
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const response = await axios.post(
      `${API_URL}/auth/login/telegram/widget`,
      { data: user },
      { withCredentials: true },
    );
    return response.data;
  } catch {
    toast.error("Не удалось войти в систему, попробуйте снова.");
    localStorage.removeItem("user");
    return null;
  }
};

export const getCart = async (): Promise<Any> => {
  const response = await api.get("/cart");
  return response.data;
};

export const addCartItem = async ({
  product_id,
  quantity = 1,
}: {
  product_id: string | number;
  quantity?: number;
}): Promise<Any> => {
  const response = await api.post(
    "/cart",
    { product_id, quantity },
    { withCredentials: true },
  );
  return response.data;
};

export const updateCartItemQuantity = async ({
  product_id,
  quantity,
}: {
  product_id: string | number;
  quantity: number;
}): Promise<Any> => {
  const response = await api.patch(`/cart/${product_id}`, { quantity });
  return response.data;
};

export const removeCartItem = async (
  product_id: string | number,
): Promise<Any> => {
  const response = await api.delete(`/cart/${product_id}`);
  return response.data;
};

export const clearServerCart = async (): Promise<Any> => {
  const response = await api.delete("/cart");
  return response.data;
};

export {
  getProducts,
  newOrder,
  payTBank,
  getUser,
  getSingleProduct,
  getCategories,
  getProductsByType,
  getProductsById,
  getProductsByTypeWithLimit,
  getNewProducts,
  getProductsBySearch,
};
