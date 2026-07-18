"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import logo from "@/img/logo.png";
import "./auth.css";

// TelegramAuthButton использует MutationObserver/postMessage — только клиент.
// Динамический импорт с ssr: false, иначе SSR падает.
const TelegramAuthButton = dynamic(
  () =>
    import("@/auth/TelegramAuthButton").then((m) => ({
      default: m.TelegramAuthButton,
    })),
  { ssr: false },
);

/**
 * Содержимое страницы авторизации.
 * useSearchParams() требует Suspense-границы при статической prerender-генерации
 * (требование Next.js App Router), поэтому обёрнуто в <Suspense> в AuthClient.
 */
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (localStorage.getItem("user")) {
      router.replace(redirectTo);
    }
  }, [router, redirectTo]);

  return (
    <div className="container-order-data">
      <div className="order-form order-form-auth">
        <div className="logo-container">
          <img src={logo.src} className="logoIcon" alt="Logo" />
        </div>

        <main className="telegram-wrapper">
          <TelegramAuthButton
            onAuth={(data) => {
              localStorage.setItem("user", JSON.stringify(data));
              router.replace(redirectTo);
            }}
          />
          <p className="politic">
            Авторизовываясь на маркетплейсе Тоймаркет через сервис Telegram, Вы
            соглашаетесь с
            <a
              href="https://spruton.ru/legal/privacy/"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Политикой конфиденциальности{" "}
            </a>
            и
            <a
              href="https://spruton.ru/legal/rules/"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Пользовательским соглашением{" "}
            </a>
            платформы СПРУТОН
          </p>
        </main>

        <footer className="footer-auth">
          <p>
            Работает на платформе
            <a href="https://spruton.ru/" target="_blank" rel="noreferrer">
              {" "}
              СПРУТОН{" "}
            </a>
            Интегратор
            <a href="https://octobyte.ru/" target="_blank" rel="noreferrer">
              {" "}
              Октобайт{" "}
            </a>
          </p>
          <span>
            Не проходит авторизация? <br /> Попробуйте зайти с помощью VPN!
          </span>
        </footer>
      </div>
    </div>
  );
}

export default function AuthClient() {
  return (
    <Suspense fallback={<div className="auth-loading" />}>
      <AuthContent />
    </Suspense>
  );
}
