"use client";

import { useRouter as useNextRouter } from "next/navigation";

/**
 * Тонкая обёртка над useRouter() из next/navigation.
 * Даёт привычный интерфейс навигации, совместимый с тем,
 * как код использовал useNavigate() из react-router-dom:
 *   navigate("/path"), navigate(-1), navigate("/path", { replace: true })
 *
 * Используется хуком useGoBackOrHome и в компонентах при миграции.
 */
export const useNavigate = () => {
  const router = useNextRouter();

  const navigate = (
    to: string | number,
    options?: { replace?: boolean },
  ) => {
    if (typeof to === "number") {
      //.navigate(-1) → назад
      if (to < 0) router.back();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };

  return {
    push: (href: string) => router.push(href),
    replace: (href: string) => router.replace(href),
    back: () => router.back(),
    forward: () => window.history.forward(),
    refresh: () => router.refresh(),
    navigate,
  };
};
