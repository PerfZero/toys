import { useNavigate } from "@/hooks/navigation";

/**
 * useGoBackOrHome — назад по истории, либо на главную, если истории нет.
 * Перенесено из utils/goBackOrHome.js (был useNavigate из react-router-dom).
 * Теперь работает поверх useRouter() из next/navigation.
 */
export const useGoBackOrHome = () => {
  const router = useNavigate();

  const goBackOrHome = () => {
    if (window.history.state && window.history.state.idx > 0) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return goBackOrHome;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export const calculatePrice = (inCart: Any, product: Any): number => {
  if (!inCart.quantity || !product) return 0;

  const quantity =
    parseInt(String(inCart.quantity * product.inBox)) % product.inPackage !== 0
      ? Math.ceil(inCart.quantity * product.inBox)
      : parseInt(String(inCart.quantity * product.inBox));

  return quantity * product.price;
};

export const calculateQuantity = (product: Any): number => {
  return parseInt(String(product.quantity * product.inBox)) % product.inPackage !== 0
    ? Math.ceil(product.quantity * product.inBox)
    : parseInt(String(product.quantity * product.inBox));
};

/** Склонение русских слов по числу: getDeclination(5, ['товар','товара','товаров']). */
export const getDeclination = (
  decl: number,
  words?: [string, string, string],
): string | null => {
  if (words) {
    const count = Math.floor(decl);
    const cases = [2, 0, 1, 1, 1, 2];
    const index =
      count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)];
    return `${count} ${words[index]}`;
  }
  return null;
};

/** Форматирование числа с разделением разрядов пробелом: 1234567 → "1 234 567". */
export default function formatNumber(num: number | string): string {
  return parseInt(String(num))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const numberFormat = formatNumber;
