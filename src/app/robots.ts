import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

/**
 * robots.txt — генерируется Next.js на /robots.txt.
 *
 * Разрешаем индексацию всего, кроме служебных/приватных разделов (заказы,
 * авторизация — личные данные пользователя). Sitemap указываем явно.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/orders", "/orderInfo", "/auth", "/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
