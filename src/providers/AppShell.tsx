"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import AuthGuard from "./AuthGuard";

/**
 * AppShell — клиентская оболочка приложения.
 *
 * Рендерит Header/Footer везде, кроме страницы /auth (как было в src/App.jsx:
 *   { !isAuthPage && <Header/> } / { !isAuthPage && <Footer/> }),
 * и оборачивает страницы в AuthGuard (защита /orders, /orderInfo/*).
 *
 * mounted-флаг: TMA — клиентское приложение, но Next рендерит первый кадр на
 * сервере. Сервер не имеет доступа к window.Telegram, localStorage, cart из
 * localStorage и т.п., из-за чего возникал hydration-mismatch (badge корзины,
 * --tg-viewport-height от Telegram SDK). Поэтому реальный контент рендерим
 * только после монтирования на клиенте — сервер и первый клиентский кадр
 * отдают одинаковый пустой shell, расхождений нет.
 */
export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // До монтирования на клиенте — пустой shell (совпадает с серверным кадром).
  if (!mounted) {
    return <div className="app" />;
  }

  const isAuthPage = pathname === "/auth";

  return (
    <div className="app">
      {!isAuthPage && <Header />}
      <AuthGuard>{children}</AuthGuard>
      {!isAuthPage && <Footer />}
    </div>
  );
}
