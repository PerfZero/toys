import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

import ReduxProvider from "@/providers/ReduxProvider";
import TelegramProvider from "@/providers/TelegramProvider";
import AppearanceProvider from "@/providers/AppearanceProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import AppShell from "@/providers/AppShell";

/**
 * Это Telegram Mini App — полностью клиентское приложение внутри WebView.
 * SSR/prerender здесь не нужен (и невозможен: страницы обращаются к window,
 * localStorage, window.Telegram при инициализации). Отключаем статическую
 * генерацию, чтобы сборка не падала на браузерных API.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TOYMARKET",
  description: "Интернет-магазин по продаже игрушек",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/logo192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c1c1c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* Telegram Mini App SDK. beforeInteractive — доступ к window.Telegram
            сразу при гидратации клиента. Загружаем локально (надёжнее CDN). */}
        <Script src="/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body>
        <ReduxProvider>
          <TelegramProvider>
            <AppearanceProvider>
              <ToasterProvider>
                <AppShell>{children}</AppShell>
              </ToasterProvider>
            </AppearanceProvider>
          </TelegramProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
