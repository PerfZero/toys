"use client";

import { Toaster } from "react-hot-toast";

/**
 * Глобальный Toaster для уведомлений (react-hot-toast).
 * Заменял <Toaster /> из App.jsx.
 */
export default function ToasterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
