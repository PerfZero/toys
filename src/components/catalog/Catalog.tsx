"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetCategoriesQuery,
  useLazyGetNewProductsLazyQuery,
  useLazyGetProductsByTypeWithLimitQuery,
} from "@/store/api/productsApi";
import { LuChevronRight } from "react-icons/lu";
import { useNavigate } from "@/hooks/navigation";
import "./Catalog.css";
import loader from "./loader1.svg";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard, { getGroupKey, canShowGroup } from "./ProductCard";

const HOME_SECTION_PRODUCT_LIMIT = 50;

const groupProducts = (items: any = []) => {
  const groups = new Map();

  items.forEach((product: any) => {
    const key = getGroupKey(product);

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        products: [],
      });
    }

    groups.get(key).products.push(product);
  });

  return Array.from(groups.values()).filter((group: any) =>
    canShowGroup(group.products)
  );
};

function CatalogSection({
  title,
  products = [],
  isLoading = false,
  onTitleClick,
  sectionRef,
  shouldRenderEmpty = false,
}: any) {
  const productGroups = useMemo(() => groupProducts(products), [products]);

  if (!shouldRenderEmpty && !isLoading && productGroups.length === 0) {
    return null;
  }

  return (
    <div ref={sectionRef} className="catalogItem">
      <p onClick={onTitleClick} className="catalogItem_title">
        <span>{title}</span>
        <LuChevronRight />
      </p>

      {isLoading ? (
        <div className="catalogItem_loading">
          <img width={48} src={loader.src} alt="" />
        </div>
      ) : productGroups.length > 0 ? (
        <div>
          <Swiper
            modules={[FreeMode]}
            freeMode={true}
            spaceBetween={10}
            slidesPerView="auto"
            className="product-swiper"
          >
            {productGroups.slice(0, 9).map((group: any) => (
              <SwiperSlide key={group.id} style={{ width: "180px" }}>
                <ProductCard products={group.products} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="catalogItem_pending" />
      )}
    </div>
  );
}

function LazyCategorySection({ category }: any) {
  const nav = useNavigate();
  const sectionRef = useRef(null);

  const [shouldLoad, setShouldLoad] = useState(false);
  const [products, setProducts] = useState<any[] | null>(null);
  const [triggerGetProducts, { isFetching }] =
    useLazyGetProductsByTypeWithLimitQuery();

  useEffect(() => {
    const node = sectionRef.current;

    if (!node || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    let isMounted = true;

    if (!shouldLoad || products) return;

    triggerGetProducts({
      id: category.id,
      limit: HOME_SECTION_PRODUCT_LIMIT,
    })
      .unwrap()
      .then((productsData: any) => {
        if (isMounted) {
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      })
      .catch((err: any) => {
        console.error(
          `Error fetching products for category ID ${category.id}:`,
          err
        );

        if (isMounted) {
          setProducts([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category.id, products, shouldLoad, triggerGetProducts]);

  return (
    <CatalogSection
      title={category.name}
      products={products || []}
      isLoading={shouldLoad && (isFetching || products === null)}
      onTitleClick={() => nav.push("/cat/" + category.id)}
      sectionRef={sectionRef}
      shouldRenderEmpty={products === null}
    />
  );
}

function Catalog() {
  const nav = useNavigate();

  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newProductsData] = useLazyGetNewProductsLazyQuery();
  const { data: categoriesData } = useGetCategoriesQuery(undefined);

  const categories = useMemo(() => categoriesData || [], [categoriesData]);

  useEffect(() => {
    let isMounted = true;

    const fetchNewProducts = async () => {
      setIsLoading(true);

      try {
        const newProductsResponse = await newProductsData({
          limit: 20,
          inStock: true,
        }).unwrap();

        if (isMounted) {
          setNewProducts(newProductsResponse || []);
        }
      } catch (err) {
        console.error("Error fetching new products:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNewProducts();

    return () => {
      isMounted = false;
    };
  }, [newProductsData]);

  if (isLoading) {
    return (
      <div className="loader">
        <img width={100} src={loader.src} alt="" />
      </div>
    );
  }

  return (
    <div className="catalog container">
      <CatalogSection
        title="Новинки"
        products={newProducts}
        onTitleClick={() => nav.push("/new/")}
      />

      {categories.map((category: any) => (
        <LazyCategorySection key={category.id} category={category} />
      ))}
    </div>
  );
}

export default Catalog;
