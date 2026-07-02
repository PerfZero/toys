"use client";

import { useEffect } from "react";

/**
 * TelegramProvider — клиентская инициализация Telegram Mini App.
 *
 * Перенесено из src/App.jsx (бывший useEffect, строки 35-75):
 *   - tg.ready(), tg.expand()
 *   - классы body: telegram-webapp, mobile-tma
 *   - отладка через ?tmaDebug=1
 *
 * Весь доступ к window.Telegram — только здесь, на клиенте.
 */
export default function TelegramProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    // Отладка через ?tmaDebug=1 — форсирует мобильный вид на компе
    const isDebug = new URLSearchParams(window.location.search).has("tmaDebug");

    if (tg && tg.initData) {
      tg.ready();
      tg.expand();
      document.body.classList.add("telegram-webapp");

      // Мобильный TMA: шапка Telegram занимает место сверху — нужен отступ.
      // Десктоп (tdesktop) и обычный браузер — отступ не нужен.
      const platform = tg.platform || "";
      const isMobileTMA =
        platform === "ios" || platform === "android" || platform === "web";
      if (isMobileTMA || isDebug) {
        document.body.classList.add("mobile-tma");
      }

      if (isDebug) {
        // eslint-disable-next-line no-console
        console.log("[TMA]", {
          platform,
          initData: Boolean(tg.initData),
          safeAreaInset: tg.safeAreaInset,
          contentSafeAreaInset: tg.contentSafeAreaInset,
          cssSafeAreaTop: getComputedStyle(document.documentElement)
            .getPropertyValue("--tg-safe-area-inset-top")
            .trim(),
          cssContentSafeAreaTop: getComputedStyle(document.documentElement)
            .getPropertyValue("--tg-content-safe-area-inset-top")
            .trim(),
          version: tg.version,
        });
      }
    } else if (isDebug) {
      // Нет Telegram WebApp — меняем только мобильную компоновку, без fake safe area.
      document.body.classList.add("mobile-tma");
    }
  }, []);

  return <>{children}</>;
}
