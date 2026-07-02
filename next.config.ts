import type { NextConfig } from "next";
import path from "path";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.toymarket.site";

const nextConfig: NextConfig = {
  // Собираем standalone-бандл для будущего деплоя в Docker / на VPS.
  output: "standalone",

  // Явно указываем корень проекта: в родительской папке anton-web лежит
  // чужой package-lock.json, из-за которого Next неправильно определял root
  // и не находил каталог app/.
  turbopack: {
    root: path.join(__dirname),
  },

  // Дев-прокси /api/* → бэкенд toymarket (замена CRA setupProxy.js).
  // В проде те же реврайты работают внутри Node-сервера Next.js.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
