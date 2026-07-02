"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Обёртки над Telegram WebApp SDK.
 *
 * Базовый скрипт telegram-web-app.js подключается в app/layout.tsx через next/script
 * и выставляет глобальный window.Telegram.WebApp. Эти хуки — типобезопасный доступ к нему
 * с защитой от SSR (window недоступен на сервере).
 */

// Минимальная типизация глобального Telegram-объекта.
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: unknown;
  platform: string;
  version: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  safeAreaInset?: { top: number; bottom: number; left: number; right: number };
  contentSafeAreaInset?: { top: number; bottom: number; left: number; right: number };
  themeParams?: Record<string, string>;
  colorScheme?: "light" | "dark";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/** Безопасный доступ к WebApp (null на сервере или если скрипт ещё не загрузился). */
export const getWebApp = (): TelegramWebApp | null => {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
};

/** true, если приложение запущено внутри Telegram Mini App. */
export const isTMA = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(window.Telegram?.WebApp?.initData);
};

/**
 * useTelegram — возвращает WebApp после монтирования на клиенте.
 * Первый рендер вернёт null (важно для SSR-гидратации).
 */
export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    setWebApp(getWebApp());
  }, []);

  return webApp;
};

/**
 * useHaptic — возвращает функцию для вибро-отклика.
 * Заглушка (no-op), если вне Telegram.
 */
export const useHaptic = () => {
  const impactOccurred = useCallback(
    (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") => {
      try {
        getWebApp()?.HapticFeedback?.impactOccurred(style);
      } catch {
        /* вне Telegram — игнорируем */
      }
    },
    [],
  );

  const notificationOccurred = useCallback(
    (type: "error" | "success" | "warning") => {
      try {
        getWebApp()?.HapticFeedback?.notificationOccurred(type);
      } catch {
        /* вне Telegram — игнорируем */
      }
    },
    [],
  );

  return { impactOccurred, notificationOccurred };
};
