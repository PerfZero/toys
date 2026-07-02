"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { getToken } from "@/lib/api";
import { isTMA } from "@/lib/telegram";
import { setUserInfo } from "@/store/slices/cartSlice";

const PROTECTED_PREFIXES = ["/orders", "/orderInfo"];

/**
 * AuthGuard — клиентская защита роутов /orders и /orderInfo/*.
 *
 * Перенесено из src/App.jsx (бывший useEffect, строки 101-131).
 *
 * Остался клиентским (а не middleware.ts), т.к. guard проверяет:
 *   - localStorage.user (браузерный флоу виджета Telegram Login)
 *   - window.Telegram.WebApp.initData (TMA-флоу)
 * Ни то, ни другое недоступно в серверном middleware.
 */
export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );

    const user = localStorage.getItem("user");
    const tma = isTMA();

    // Редирект при отсутствии авторизации (только браузерный флоу — TMA пускает по initData)
    if (!user && isProtectedRoute && !tma) {
      const redirect = pathname + window.location.search;
      router.replace(`/auth?redirect=${encodeURIComponent(redirect)}`);
      setIsAuthReady(true);
      return;
    }

    (async () => {
      if ((user || tma) && isProtectedRoute) {
        const userData = await getToken();
        if (userData) {
          dispatch(setUserInfo(userData));
        } else if (!tma) {
          const redirect = pathname + window.location.search;
          router.replace(`/auth?redirect=${encodeURIComponent(redirect)}`);
          setIsAuthReady(true);
          return;
        }
      }
      setIsAuthReady(true);
    })();
  }, [pathname, dispatch, router]);

  // На защищённых роутах ждём проверки авторизации; иначе рисуем сразу.
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtectedRoute && !isAuthReady) {
    return <div className="auth-loading" />;
  }

  return <>{children}</>;
}
