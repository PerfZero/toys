import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

import ReduxProvider from "@/providers/ReduxProvider";
import TelegramProvider from "@/providers/TelegramProvider";
import AppearanceProvider from "@/providers/AppearanceProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import AppShell from "@/providers/AppShell";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Это Telegram Mini App — полностью клиентское приложение внутри WebView.
 * SSR/prerender здесь не нужен (и невозможен: страницы обращаются к window,
 * localStorage, window.Telegram при инициализации). Отключаем статическую
 * генерацию, чтобы сборка не падала на браузерных API.
 *
 * Примечание: robots.ts и sitemap.ts — server-only route-хендлеры,
 * они НЕ затрагиваются force-dynamic страниц и работают корректно.
 */
export const dynamic = "force-dynamic";

const { url, title, description, locale } = siteConfig;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: title,
    template: `%s — ${siteConfig.name}`,
  },
  description,
  applicationName: siteConfig.name,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Toymarket",
    "тоймаркет",
    "игрушки",
    "магазин игрушек",
    "купить игрушки",
    "игрушки оптом",
    "детские игрушки",
    "маркетплейс игрушек",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    languages: { "ru-RU": "/" },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/logo192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale,
    url,
    siteName: siteConfig.name,
    title,
    description,
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "shopping",
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
    <html lang="ru" suppressHydrationWarning>
      <body>
        {/* Telegram Mini App SDK. Грузим локально (надёжнее CDN).
            beforeInteractive — window.Telegram доступен сразу при гидратации.
            next/script нельзя класть в <head> через JSX — только в <body>. */}
        <Script src="/telegram-web-app.js" strategy="beforeInteractive" />
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
