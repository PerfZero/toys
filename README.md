# Toymarket — Next.js (Telegram Mini App)

Интернет-магазин игрушек Toymarket, перенесённый с Create React App на
**Next.js 16 (App Router, TypeScript)** с полным сохранением функциональности
Telegram Mini App.

> Оригинал (CRA) лежит рядом в `../toymarket` и не модифицировался — его можно
> использовать как эталон.

## Стек

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Redux Toolkit** + **RTK Query** (стейт, корзина, продуктовые запросы)
- **Telegram Mini App SDK**: `telegram-web-app.js` (локально в `public/`) +
  хуки-обёртки в `src/lib/telegram.ts`
- Стили: plain CSS (co-located) + CSS-переменные `--appearance-*`
  (серверный white-label тема)
- Бэкенд: `https://api.toymarket.site` (не менялся), URL вынесен в
  `NEXT_PUBLIC_API_URL`

## Структура

```
src/
├── app/                    # Next.js App Router (страницы = роуты)
│   ├── layout.tsx          # корневой layout: провайдеры + Script Telegram
│   ├── page.tsx            # /            (главная)
│   ├── item/[id]/          # /item/:id    (карточка товара)
│   ├── cart/               # /cart
│   ├── orders/             # /orders      (защищённый)
│   ├── orderInfo/[id]/     # /orderInfo/:id (защищённый)
│   ├── cat/[id]/ type/[id]/ subcat/[id]/ brand/[id]/
│   ├── search/ new/ auth/
│   └── not-found.tsx       # 404
├── components/             # Header, Footer, Banner, Catalog, ProductCard, …
├── providers/              # Redux, Telegram, Appearance, Toaster, AuthGuard, AppShell
├── store/                  # Redux store, slices, RTK Query
├── lib/                    # api, telegram, appearance, utils, structures
├── hooks/                  # navigation (обёртка над next/navigation)
└── img/ fonts/             # статика
```

## Разработка

```bash
npm install
npm run dev        # http://localhost:3000
```

Дев-прокси `/api/*` → `api.toymarket.site` настроен в `next.config.ts`
(замена CRA `setupProxy.js`).

### Тест внутри Telegram Mini App

Telegram требует HTTPS. Для локального теста в реальном Telegram:

```bash
# 1. Поднять HTTPS-туннель на локальный dev-сервер
ngrok http 3000                     # даст https://<id>.ngrok.io

# 2. В @BotFather → Bot Settings → Menu Button / Web App
#    указать полученный HTTPS-URL.

# 3. Открыть Mini App в Telegram и проверить.
```

Дев-режим `?tmaDebug=1` форсирует мобильную компоновку на десктопе
(как и в оригинале).

## Сборка

```bash
npm run build      # typecheck + production-сборка (output: standalone)
npm run start      # запуск production-сервера на :3000
```

Все роуты помечены `dynamic` (TMA — клиентское приложение, SSR/prerender не
используется).

## Деплой на VPS (Docker)

`output: "standalone"` в `next.config.ts` создаёт автономный бандл —
образ получается маленьким.

```bash
# На сервере (или локально с последующим push образа):
docker compose up -d --build

# При другом бэкенде:
NEXT_PUBLIC_API_URL=https://my-api.example docker compose up -d --build
```

Контейнер слушает порт **3000**. Перед ним обычно ставят nginx/caddy с
terminating-HTTPS (Telegram требует HTTPS для TMA).

> ⚠️ `NEXT_PUBLIC_*` вшивается в клиентский бандл на этапе сборки, поэтому
> смена бэкенда требует пересборки образа (`--build-arg`).

## Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.toymarket.site` | URL бэкенда (build-time) |

## Чек-лист TMA-функциональности

Перенесено из оригинала и работает:
- [x] Авторизация через `initData` (`/auth/login/telegram/miniapp`)
- [x] Telegram Login Widget (браузерный флоу, `ssr: false`)
- [x] safe-area отступы (`--tg-safe-area-inset-*`)
- [x] Haptic feedback (Header, Order, OrderInfo)
- [x] `?tmaDebug=1` режим
- [x] white-label тема (`--appearance-*` из `/appearance/style`)
- [x] cookie-сессии (`withCredentials`)
- [x] cart persistence в `localStorage`
