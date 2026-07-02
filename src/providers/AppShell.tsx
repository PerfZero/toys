"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";

/**
 * AppShell — клиентская оболочка приложения.
 *
 * ВАЖНО для SSR/SEO: Header/Footer рендерятся только на клиенте (dynamic ssr:false),
 * т.к. они используют RTK Query, Redux cart, window — это вызвало бы hydration
 * mismatch на сервере. Контент страниц (children) при этом рендерится на сервере
 * с реальными данными — именно это даёт SEO.
 *
 * Header/Footer — навигация, не критичны для поисковиков; появляются после
 * гидратации (в TMA внутри WebView это мгновенно).
 */
const Header = dynamic(
  () => import("@/components/header/Header").then((m) => ({ default: m.Header })),
  { ssr: false },
);
const Footer = dynamic(() => import("@/components/footer/Footer"), {
  ssr: false,
});

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <div className="app">
      {!isAuthPage && <Header />}
      {/* AuthGuard не блокирует публичные роуты — для них сразу возвращает children.
          Защищает только /orders и /orderInfo (показывает auth-loading до проверки). */}
      <AuthGuard>{children}</AuthGuard>
      {!isAuthPage && <Footer />}
    </div>
  );
}
