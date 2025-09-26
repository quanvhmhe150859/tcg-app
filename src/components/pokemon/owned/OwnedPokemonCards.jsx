import React, { useEffect, useState, useRef } from "react";
import api from "../../../utils/api";
import CardItemPokemon from "../CardItemPokemon";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../common/RandomCards.module.css";
import { useTranslation } from "react-i18next";
import Pagination from "../../common/Pagination";

const OwnedPokemonCards = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([]);
  const [allOwned, setAllOwned] = useState([]);   // 🔹 thêm state lưu toàn bộ
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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

    const start = (page - 1) * pageSize;
    const pageCards = allOwned.slice(start, start + pageSize);

    // 🔹 Nếu cache có rồi thì dùng ngay
    if (cacheRef.current[page]) {
      setCards(cacheRef.current[page]);
      return;
    }

    // 🔹 Nếu chưa có thì gọi API
    setLoading(true);
    try {
      const res = await api.post("/api/pokemon/get-owned", {
        cards: pageCards,
      });

      cacheRef.current[page] = res.data; // lưu cache
      setCards(res.data);
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
      setCards([]); // để hiển thị "chưa có thẻ"
    }
  }, [page, allOwned]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{t("listOfOwnedPokemonCards")}</h1>

      {loading && <p>Đang tải...</p>}

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
