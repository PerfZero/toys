import AuthClient from "./AuthClient";

/**
 * Страница авторизации /auth.
 *
 * Помечена force-dynamic, потому что внутри используется useSearchParams
 * (через AuthClient). При статической prerender-генерации Suspense fallback
 * залипал и форма с кнопкой "Войти через Telegram" не появлялась.
 * Динамический рендер гарантирует корректную отдачу.
 */
export const dynamic = "force-dynamic";

export default function AuthPage() {
  return <AuthClient />;
}
