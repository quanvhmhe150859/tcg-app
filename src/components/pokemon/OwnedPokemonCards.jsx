import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/api";
import CardItemPokemon from "./CardItemPokemon";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../common/RandomCards.module.css";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";

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

  // Cache lưu kết quả các trang đã gọi
  const cacheRef = useRef({});

  // Load toàn bộ owned cards từ localStorage khi component mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cards") || "{}");
    const owned = stored.pokemon || [];
    // console.log("Initial allOwned quantities:", owned.map(card => card.quantity));
    // console.log("Initial allOwned IDs:", owned.map(card => card.cardID));
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
      // console.log(`Sorting by ${sortBy}, order: ${sortOrder}`);
      // console.log(`Comparing card ${a.cardID} (quantity: ${a.quantity}) with card ${b.cardID} (quantity: ${b.quantity})`);

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

    // console.log("Sorted quantities:", sortedCards.map(card => card.quantity));
    // console.log("Sorted IDs:", sortedCards.map(card => card.cardID));

    const start = (page - 1) * pageSize;
    const pageCards = sortedCards.slice(start, start + pageSize);
    // console.log("Page cards sent to API:", pageCards.map(card => ({ cardID: card.cardID, quantity: card.quantity })));

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
      // console.log("Using cached cards, quantities:", cached.map(c => c.quantity));
      // console.log("Using cached cards, IDs:", cached.map(c => c.id));
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

      // console.log("Raw API response quantities:", res.data.map(c => c.quantity));
      // console.log("Raw API response IDs:", res.data.map(c => c.id));
      // console.log("Fetched cards, quantities:", sortedRes.map(c => c.quantity));
      // console.log("Fetched cards, IDs:", sortedRes.map(c => c.id));
    } catch (err) {
      console.error("Failed to fetch owned pokemon cards", err);
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

      {loading && <p>{t("loading")}</p>}

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
                <AnimatePresence>
                  {cards.filter(Boolean).map((card, index) => (
                    <motion.div
                      key={`${card.id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardItemPokemon card={card} index={index} />
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