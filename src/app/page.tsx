import Link from "next/link";
import Banner from "@/components/banner/Banner";
import Catalog from "@/components/catalog/Catalog";
import ProductCardPreview from "@/components/catalog/ProductCardPreview";
import CartTotalBadge from "@/components/home/CartTotalBadge";
import { getCategoriesSSR, getNewProductsSSR } from "@/lib/ssr-api";
import "./home.css";

// Свежие данные: каталог/наличие актуальны на каждый запрос.
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  // Параллельно тянем категории и новинки — всё публичное, без авторизации.
  const [categories, newProducts] = await Promise.all([
    getCategoriesSSR(),
    getNewProductsSSR(20),
  ]);

  return (
    <div className="home">
      <Banner />

      {/* Интерактивный каталог (клиентский островок): ленивая подгрузка
          категорий, Swiper, корзина в карточках. Тянет данные через RTK Query. */}
      <Catalog />

      {/* Бейдж «В корзине товаров на N ₽» — клиентский (зависит от Redux cart). */}
      <CartTotalBadge />

      {/* Статичный SEO-блок: новинки + категории. Виден поисковикам без JS,
          дублирует ключевые данные каталога. Скрыт визуально. */}
      <section
        aria-label="Новинки и категории"
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <h1>Toymarket — интернет-магазин игрушек</h1>
        <p>
          Интернет-магазин игрушек Toymarket: большой выбор детских игрушек,
          доставка по России, оплата онлайн.
        </p>

        {newProducts.length > 0 && (
          <div>
            <h2>Новинки</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {newProducts.slice(0, 20).map((p) => (
                <li key={p.id} style={{ display: "inline-block", margin: 8 }}>
                  <ProductCardPreview product={p} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {categories.length > 0 && (
          <div>
            <h2>Категории товаров</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {categories.map((c) => (
                <li key={c.id} style={{ display: "inline-block", margin: 8 }}>
                  <Link href={`/cat/${c.id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
