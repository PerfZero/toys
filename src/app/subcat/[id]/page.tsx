"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useLazyGetProductsBySubcategoryIdQuery } from "@/store/api/productsApi";
import filterIcon from "@/img/filter.svg";
import sortIcon from "@/img/sort.svg";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import FilterModal from "@/components/categoryProducts/FilterModal";
import { BsChevronLeft } from "react-icons/bs";
import "@/components/categoryProducts/CategoryProducts.css";
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

function BySubcategories() {
  const { id } = useParams<{ id: string }>();
  const [getProductsBySubCategoryId, { isLoading }] =
    useLazyGetProductsBySubcategoryIdQuery();

  const searchQuery = useSelector((state: any) => state.search.searchQuery);

  const [products, setProducts] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusAccordionOpen, setStatusAccordionOpen] = useState(false);
  const [statusPriceOpen, setStatusPriceOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    status: "all",
    priceFrom: "",
    priceTo: "",
    article: "",
  });
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const limit = 50;

  const fetchMoreData = () => {
    if (!hasMore || buttonLoading) return;

    setButtonLoading(true);
    setOffset((prev) => prev + limit);
  };

  useEffect(() => {
    setOffset(0);
    setProducts([]);
    setFilteredProducts([]);
    setCategoryName("");
    setHasMore(true);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setButtonLoading(true);

        const { data: products1 } = await getProductsBySubCategoryId({
          id,
          limit,
          offset,
        });

        const productsData = products1 || [];

        const uniqueProducts = productsData
          .reduce((unique: any[], product: any) => {
            const isDuplicate = unique.some((p: any) => {
              const { _id, id, ...pRest } = p;
              const { _id: _, id: __, ...productRest } = product;

              return JSON.stringify(pRest) === JSON.stringify(productRest);
            });

            if (!isDuplicate) {
              unique.push(product);
            }

            return unique;
          }, [])
          .reduce((unique: any[], product: any) => {
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

            return unique;
          }, []);

        setProducts((prev) => {
          const updatedProducts =
            offset === 0
              ? uniqueProducts
              : [
                  ...prev,
                  ...uniqueProducts.filter(
                    (product: any) =>
                      !prev.some((prevProduct: any) => prevProduct.id === product.id)
                  ),
                ];

          setCategoryName(updatedProducts?.[0]?.subCategoryName || "Товары");

          return updatedProducts;
        });

        if (productsData.length < limit) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Subcategory products loading error:", error);
        setHasMore(false);
      } finally {
        setButtonLoading(false);
      }
    };

    fetchData();
  }, [id, offset, getProductsBySubCategoryId]);

  useEffect(() => {
    let result = [...products];

    if (pendingFilters.status === "inStock") {
      result = result.filter((product: any) => getStock(product) > 0);
    } else if (pendingFilters.status === "outOfStock") {
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
      result = result.filter((product: any) =>
        String(product.article || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
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
  }, [products, pendingFilters, searchQuery, searchValue]);

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

  const handleSearchChange = (e: any) => {
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
          <span>{categoryName}</span>
        </div>

        <input
          value={searchValue}
          onChange={handleSearchChange}
          className="search_input"
          type="text"
          placeholder="Поиск...."
        />

        <div className="right">
          <div className="form-filter">
            <button onClick={() => setIsFilterOpen(true)}>
              <img src={filterIcon.src} alt="filter icon" />
              <span style={{ color: "#363636" }}>Фильтры</span>
            </button>
          </div>

          <div className="form-sort">
            <button onClick={() => setIsSortOpen(true)}>
              <img src={sortIcon.src} alt="sort icon" />
              <span style={{ color: "#363636" }}>Сортировка</span>
            </button>
          </div>
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
              <BiPlus />
              Показать еще
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

export default BySubcategories;
