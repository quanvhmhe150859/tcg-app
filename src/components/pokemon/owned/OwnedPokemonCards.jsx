import React, { useEffect, useState, useRef } from "react";
import api from "../../../utils/api";
import CardItemPokemon from "../CardItemPokemon";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../common/RandomCards.module.css";

const OwnedPokemonCards = () => {
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cache lưu kết quả các trang đã gọi
  const cacheRef = useRef({}); // {1: [...cardsPage1], 2: [...cardsPage2], ...}

  // Lấy toàn bộ danh sách ID trong localStorage
  const getOwnedPokemon = () => {
    const stored = JSON.parse(localStorage.getItem("cards") || "{}");
    return stored.pokemon || [];
  };

  const fetchCards = async () => {
    const allOwned = getOwnedPokemon();
    setTotal(allOwned.length);

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
    fetchCards();
  }, [page]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Danh sách thẻ Pokémon đã sở hữu
      </h1>

      {loading && <p>Đang tải...</p>}

      {!loading && (
        <>
          <div>
            {cards.length === 0 ? (
              <p className="col-span-full text-center text-red-500">
                Bạn chưa sở hữu thẻ Pokémon nào
              </p>
            ) : (
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
            )}
          </div>

          {/* Phân trang */}
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trang trước
            </button>
            <span>
              Trang {page} / {Math.ceil(total / pageSize)}
            </span>
            <button
              disabled={page * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnedPokemonCards;
