"use client";

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
 */
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
      <AuthGuard>{children}</AuthGuard>
      {!isAuthPage && <Footer />}
    </div>
  );
}
