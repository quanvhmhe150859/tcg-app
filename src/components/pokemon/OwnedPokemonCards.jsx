import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import CardItemPokemon from "./CardItemPokemon";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/RandomCards.module.css";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";
import { toast } from "react-hot-toast";

const OwnedPokemonCards = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([]);
  const [allOwned, setAllOwned] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("id"); // Default sort by id
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending order
  const [noResultWarning, setNoResultWarning] = useState(false);

  // Cache lưu kết quả các trang đã gọi
  const cacheRef = useRef({});

  // Load toàn bộ owned cards từ localStorage khi component mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cards") || "{}");
    const owned = stored.pokemon || [];
    setAllOwned(owned);
    setTotal(owned.length);
  }, []);

  const fetchCards = async () => {
    if (allOwned.length === 0) {
      setCards([]);
      return;
    }

    // Sort allOwned theo sortBy + sortOrder
    const sortedCards = [...allOwned].sort((a, b) => {
      if (sortBy === "id") {
        return sortOrder === "asc"
          ? a.cardID.localeCompare(b.cardID)
          : b.cardID.localeCompare(a.cardID);
      } else {
        return sortOrder === "asc"
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      }
    });

    const start = (page - 1) * pageSize;
    const pageCards = sortedCards.slice(start, start + pageSize);

    const cacheKey = `${page}-${sortBy}-${sortOrder}`;
    if (cacheRef.current[cacheKey]) {
      // Sort lại cache trước khi dùng
      const cached = [...cacheRef.current[cacheKey]].sort((a, b) => {
        if (sortBy === "id") {
          return sortOrder === "asc"
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id);
        } else {
          return sortOrder === "asc"
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        }
      });

      setCards(cached);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/pokemon/get-owned", {
        cards: pageCards,
      });

      // Sort lại response trước khi cache
      const sortedRes = [...res.data].sort((a, b) => {
        if (sortBy === "id") {
          return sortOrder === "asc"
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id);
        } else {
          return sortOrder === "asc"
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        }
      });

      cacheRef.current[cacheKey] = sortedRes;
      setCards(sortedRes);
    } catch (err) {
      setNoResultWarning(true);
      toast.success(t("showingDemoCardInstead"));
      toast.error(t("noMatchingCardFoundOrAnErrorOccurred"));
      try {
        // Fallback to demoPokemon.json
        const response = await fetch("/demo/demo-pokemon.json");
        const fallbackData = await response.json();

        // Sort fallback data theo sortBy + sortOrder
        const sortedFallback = [...fallbackData].sort((a, b) => {
          if (sortBy === "id") {
            return sortOrder === "asc"
              ? a.id.localeCompare(b.id)
              : b.id.localeCompare(a.id);
          } else {
            return sortOrder === "asc"
              ? a.quantity - b.quantity
              : b.quantity - a.quantity;
          }
        });

        cacheRef.current[cacheKey] = sortedFallback;
        setCards(sortedFallback);
      } catch (fallbackErr) {
        console.error(
          "Failed to fetch fallback data from demoPokemon.json",
          fallbackErr
        );
        setCards([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allOwned.length > 0) {
    fetchCards();
    } else {
      setCards([]);
    }
  }, [page, allOwned, sortBy, sortOrder]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{t("listOfOwnedPokemonCards")}</h1>

      {/* Sort Controls */}
      <div className="mb-4">
        <div className="flex flex-col gap-4">
          <div className="border-1 border-solid">
            <p className="font-bold italic mb-1">{t("orderField")}</p>
            <label className="mr-4">
              <input
                type="radio"
                name="sortBy"
                value="id"
                checked={sortBy === "id"}
                onChange={() => setSortBy("id")}
                className="mr-1"
              />
              {t("cardID")}
            </label>
            <label>
              <input
                type="radio"
                name="sortBy"
                value="quantity"
                checked={sortBy === "quantity"}
                onChange={() => setSortBy("quantity")}
                className="mr-1"
              />
              {t("quantity")}
            </label>
          </div>
          <div className="border-1 border-solid">
            <p className="font-bold italic mb-1">{t("orderBy")}</p>
            <label className="mr-4">
              <input
                type="radio"
                name="sortOrder"
                value="asc"
                checked={sortOrder === "asc"}
                onChange={() => setSortOrder("asc")}
                className="mr-1"
              />
              {t("ascending")}
            </label>
            <label>
              <input
                type="radio"
                name="sortOrder"
                value="desc"
                checked={sortOrder === "desc"}
                onChange={() => setSortOrder("desc")}
                className="mr-1"
              />
              {t("descending")}
            </label>
          </div>
        </div>
      </div>

      {loading && <p>{t("loadingCards")}</p>}

      {!loading && (
        <>
          {cards.length === 0 ? (
            <p className="col-span-full text-center text-red-500">
              {t("youDontOwnAnyCardsYet")}
            </p>
          ) : (
            <div>
              {/* Phân trang */}
              <Pagination
                page={page}
                totalPages={Math.ceil(total / pageSize)}
                setPage={setPage}
                isLoading={loading}
              />

              <div className={styles.cardList}>
                {noResultWarning && (
                  <div
                    className="absolute inset-0 bg-[url('/demo/sample-watermark.png')] opacity-10 bg-repeat bg-[length:100px_100px] pointer-events-none w-full h-full z-10"
                    style={{ backgroundSize: "100px 100px" }}
                  ></div>
                )}
                <AnimatePresence>
                  {cards.filter(Boolean).map((card, index) => (
                    <motion.div
                      key={`${card.id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardItemPokemon
                        card={card}
                        index={index}
                        isApiFailed={noResultWarning}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Phân trang */}
              <Pagination
                page={page}
                totalPages={Math.ceil(total / pageSize)}
                setPage={setPage}
                isLoading={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnedPokemonCards;
