"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useLazyGetNewProductsLazyQuery } from "@/store/api/productsApi";
import filterIcon from "@/img/filter.svg";
import sortIcon from "@/img/sort.svg";
import { useSelector } from "react-redux";
import FilterModal from "@/components/categoryProducts/FilterModal";
import { BsChevronLeft } from "react-icons/bs";
import SortModal from "@/components/categoryProducts/SortModal";
import { useGoBackOrHome } from "@/lib/utils";
import loader from "@/components/catalog/loader1.svg";
import { BiPlus } from "react-icons/bi";
import ProductCard, {
  getGroupKey,
  canShowGroup,
  getPrice,
  getStock,
} from "@/components/catalog/ProductCard";

function CategoryProducts() {
  const searchQuery = useSelector((state: any) => state.search.searchQuery);

  const [offset, setOffset] = useState(0);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [processedProducts, setProcessedProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [statusAccordionOpen, setStatusAccordionOpen] = useState(false);
  const [statusPriceOpen, setStatusPriceOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    status: "all",
    priceFrom: "",
    priceTo: "",
    article: "",
  });
  const [sortOrder, setSortOrder] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [fetchNewProducts, { isLoading }] = useLazyGetNewProductsLazyQuery();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const fetchMoreData = () => {
    if (!hasMore || buttonLoading) return;

    setButtonLoading(true);
    setOffset((prev) => prev + 50);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setButtonLoading(true);

        const res = await fetchNewProducts({
          offset,
        }).unwrap();

        const data = res ?? [];

        setNewProducts((prev) => {
          const existingIds = new Set(prev.map((product: any) => product.id));
          const nextProducts = data.filter(
            (product: any) => !existingIds.has(product.id)
          );

          return [...prev, ...nextProducts];
        });

        if (data.length < 50) {
          setHasMore(false);
        }
      } catch (e) {
        console.error("Ошибка загрузки новинок:", e);
        setHasMore(false);
      } finally {
        setButtonLoading(false);
      }
    };

    load();
  }, [offset, fetchNewProducts]);

  useEffect(() => {
    const temp: any[] = [];
    const unique: any[] = [];

    newProducts.forEach((product: any) => {
      const uniqueById = temp.find((item: any) => item.id === product.id);

      if (!uniqueById) {
        temp.push(product);
      }
    });

    temp.forEach((product: any) => {
      if (
        !unique.some(
          (item: any) =>
            item.modelID === product.modelID &&
            item.model_id === product.model_id &&
            item.color === product.color
        ) ||
        product.isMultiProduct === false
      ) {
        unique.push(product);
      }
    });

    setProcessedProducts(unique);
  }, [newProducts]);

  useEffect(() => {
    let result = [...processedProducts];

    if (pendingFilters.status === "inStock") {
      result = result.filter((product: any) => getStock(product) > 0);
    }

    if (pendingFilters.status === "outOfStock") {
      result = result.filter((product: any) => getStock(product) === 0);
    }

    if (pendingFilters.priceFrom) {
      result = result.filter(
        (product: any) => getPrice(product) >= Number(pendingFilters.priceFrom)
      );
    }

    if (pendingFilters.priceTo) {
      result = result.filter(
        (product: any) => getPrice(product) <= Number(pendingFilters.priceTo)
      );
    }

    if (pendingFilters.article) {
      result = result.filter((product: any) =>
        String(product.article || "")
          .toLowerCase()
          .includes(pendingFilters.article.toLowerCase())
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      result = result.filter(
        (product: any) =>
          String(product.name || "")
            .toLowerCase()
            .includes(q) ||
          String(product.article || "")
            .toLowerCase()
            .includes(q)
      );
    }

    if (searchValue) {
      result = result.filter((product: any) =>
        String(product.name || "")
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [processedProducts, pendingFilters, searchQuery, searchValue]);

  const productGroups = useMemo(() => {
    const groups = new Map();

    filteredProducts.forEach((product: any) => {
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
  }, [filteredProducts]);

  const handleLocalSearch = (e: any) => {
    setSearchValue(e.target.value);
  };

  const back = useGoBackOrHome();

  if (isLoading && offset === 0) {
    return (
      <div className="loader">
        <img width={100} src={loader.src} alt="" />
      </div>
    );
  }

  return (
    <div className="container categoryProducts">
      <div className="categoryProducts_title">
        <div onClick={back} className="left">
          <BsChevronLeft />
          <span>Новинки</span>
        </div>

        <input
          value={searchValue}
          onChange={handleLocalSearch}
          className="search_input"
          type="text"
          placeholder="Поиск...."
        />

        <div className="right">
          <button className="form-filter" onClick={() => setIsFilterOpen(true)}>
            <img src={filterIcon.src} alt="filter" />
            <span>Фильтры</span>
          </button>

          <button className="form-sort" onClick={() => setIsSortOpen(true)}>
            <img src={sortIcon.src} alt="sort" />
            <span>Сортировка</span>
          </button>
        </div>
      </div>

      {productGroups.length === 0 ? (
        <div className="noProducts">
          <p className="noMore">Товаров нет!</p>
        </div>
      ) : (
        <>
          <div className="catalogItem_cards">
            {productGroups.map((group: any) => (
              <ProductCard key={group.id} products={group.products} />
            ))}
          </div>

          {buttonLoading && hasMore && (
            <div className="loader" style={{ marginTop: 20 }}>
              <img width={100} src={loader.src} alt="" />
            </div>
          )}

          {!hasMore && filteredProducts.length > 0 && (
            <p className="noMore">Других товаров нет!</p>
          )}

          {hasMore && !buttonLoading && (
            <button className="load_more" onClick={fetchMoreData}>
              <BiPlus /> Показать еще
            </button>
          )}
        </>
      )}

      <FilterModal
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        pendingFilters={pendingFilters}
        setPendingFilters={setPendingFilters}
        statusAccordionOpen={statusAccordionOpen}
        setStatusAccordionOpen={setStatusAccordionOpen}
        statusPriceOpen={statusPriceOpen}
        setStatusPriceOpen={setStatusPriceOpen}
      />

      <SortModal
        isSortOpen={isSortOpen}
        setIsSortOpen={setIsSortOpen}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filteredProducts={filteredProducts}
        setFilteredProducts={setFilteredProducts}
      />
    </div>
  );
}

export default CategoryProducts;
