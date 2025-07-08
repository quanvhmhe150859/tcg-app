// import React, { useEffect, useState } from "react";
// import api from "../utils/api";
// import CardItem from "./CardItem";
// import { AnimatePresence, motion } from "framer-motion";
// import styles from "./RandomCards.module.css";
// import { allTypes, allRarities } from "../utils/constants";
// import { Tooltip } from "react-tooltip";

// const RandomCards = () => {
//   const [cards, setCards] = useState([]);
//   const [isRolling, setIsRolling] = useState(false);
//   const [rollMode, setRollMode] = useState("all");
//   const [selectedType, setSelectedType] = useState("");
//   const [selectedRarity, setSelectedRarity] = useState("");
//   const [noResultWarning, setNoResultWarning] = useState(false);

//   const allowedTypes = JSON.parse(localStorage.getItem("allowedTypes")) || [];
//   const allowedRarities =
//     JSON.parse(localStorage.getItem("allowedRarities")) || [];

//   const hasValidType = allowedTypes.length > 0;
//   const hasValidRarity = allowedRarities.length > 0;

//   const filteredTypes = allTypes.filter((type) => allowedTypes.includes(type));
//   const filteredRarities = allRarities.filter((rarity) =>
//     allowedRarities.includes(rarity)
//   );

//   const rollCards = async (count = 1) => {
//     const rolled = [];
//     for (let i = 0; i < count; i++) {
//       const randomPage = Math.floor(Math.random() * 80) + 1;
//       const response = await api.get(
//         `https://api.pokemontcg.io/v2/cards?page=${randomPage}&pageSize=250`
//       );
//       const cardsList = response.data.data || [];
//       if (cardsList.length === 0) continue;
//       const randomCard =
//         cardsList[Math.floor(Math.random() * cardsList.length)];
//       if (randomCard) rolled.push(randomCard);
//     }
//     return rolled;
//   };

//   const rollByCombo = async (count = 1) => {
//     const q = [];
//     if (selectedType) q.push(`types:\"${selectedType}\"`);
//     if (selectedRarity) q.push(`rarity:\"${selectedRarity}\"`);
//     const query = q.join(" ");

//     const result = [];
//     const pageSize = 250;

//     // Step 1: get total count
//     const res1 = await api.get(
//       `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
//         query
//       )}&page=1&pageSize=1`
//     );
//     const total = res1.data.totalCount || 0;
//     if (total === 0) {
//       setNoResultWarning(true);
//       return [];
//     }
//     setNoResultWarning(false);

//     const totalPages = Math.ceil(total / pageSize);

//     for (let i = 0; i < count; i++) {
//       const randomPage = Math.floor(Math.random() * totalPages) + 1;
//       const res2 = await api.get(
//         `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
//           query
//         )}&page=${randomPage}&pageSize=${pageSize}`
//       );
//       const data = res2.data.data || [];
//       if (data.length === 0) continue;
//       const random = data[Math.floor(Math.random() * data.length)];
//       if (random) result.push(random);
//     }
//     return result;
//   };

//   const rollBySupertype = async (supertype, count = 1) => {
//     const result = [];
//     const query = `supertype:"${supertype}"`;
//     const pageSize = 250;

//     const res1 = await api.get(
//       `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
//         query
//       )}&page=1&pageSize=1`
//     );
//     const total = res1.data.totalCount || 0;
//     if (total === 0) {
//       setNoResultWarning(true);
//       return [];
//     }

//     const totalPages = Math.ceil(total / pageSize);

//     for (let i = 0; i < count; i++) {
//       const randomPage = Math.floor(Math.random() * totalPages) + 1;
//       const res2 = await api.get(
//         `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
//           query
//         )}&page=${randomPage}&pageSize=${pageSize}`
//       );
//       const data = res2.data.data || [];
//       const random = data[Math.floor(Math.random() * data.length)];
//       if (random) result.push(random);
//     }

//     return result;
//   };

//   const handleRoll = async (count = 1) => {
//     setIsRolling(true);
//     setNoResultWarning(false);

//     const result = [];
//     const maxTries = count * 3; // để tránh vòng lặp vô hạn nếu API quá hẹp

//     let tries = 0;
//     while (result.length < count && tries < maxTries) {
//       let newCards = [];

//       if (rollMode === "combo") {
//         newCards = await rollByCombo(1);
//       } else if (rollMode === "energy") {
//         newCards = await rollBySupertype("Energy", 1);
//       } else if (rollMode === "trainer") {
//         newCards = await rollBySupertype("Trainer", 1);
//       } else {
//         newCards = await rollCards(1);
//       }

//       if (newCards.length > 0 && newCards[0]) {
//         result.push(newCards[0]);
//       }

//       tries++;
//     }

//     if (result.length < count) {
//       console.warn(
//         `⚠️ Chỉ roll được ${result.length}/${count} card sau ${tries} lần thử.`
//       );
//     }

//     await new Promise((res) => setTimeout(res, 500));
//     setCards(result);
//     setIsRolling(false);
//   };

//   const totalPrice = cards
//     .reduce((sum, card) => {
//       const price =
//         card?.tcgplayer?.prices?.normal?.market ??
//         card?.tcgplayer?.prices?.holofoil?.market ??
//         0;
//       return sum + price;
//     }, 0)
//     .toFixed(2);

//   const modes = [
//     {
//       id: "all",
//       label: "🌐 Tất cả",
//       tooltip: "Roll ngẫu nhiên từ toàn bộ thẻ trong bộ sưu tập",
//     },
//     ...(hasValidType || hasValidRarity
//       ? [
//           {
//             id: "combo",
//             label: "🔥 Theo Type + Rarity",
//             tooltip: "Chọn loại Pokémon và độ hiếm để roll chính xác hơn",
//           },
//         ]
//       : []),
//     {
//       id: "energy",
//       label: "⚡ Energy",
//       tooltip: "Chỉ roll các thẻ năng lượng (Energy cards)",
//     },
//     {
//       id: "trainer",
//       label: "📘 Trainer",
//       tooltip: "Chỉ roll các thẻ huấn luyện (Trainer cards)",
//     },
//   ];

//   return (
//     <div className={styles.randomCardsContainer}>
//       <h2>🎴 Pokémon Card Roll</h2>

//       {/* Tabs */}
//       <div className={styles.tabs}>
//         {modes.map((mode) => (
//           <div key={mode.id}>
//             <button
//               data-tooltip-id={`tooltip-${mode.id}`}
//               data-tooltip-content={mode.tooltip}
//               className={`roll-tab ${
//                 rollMode === mode.id ? "selected-tab" : ""
//               }`}
//               onClick={() => setRollMode(mode.id)}
//             >
//               {mode.label}
//             </button>
//             <Tooltip id={`tooltip-${mode.id}`} place="top" />
//           </div>
//         ))}
//       </div>

//       {/* Combo Mode Controls */}
//       {rollMode === "combo" && (hasValidType || hasValidRarity) && (
//         <div className={styles.comboControls}>
//           {hasValidType && (
//             <select
//               value={selectedType}
//               onChange={(e) => setSelectedType(e.target.value)}
//               disabled={isRolling}
//             >
//               <option value="">-- Chọn type --</option>
//               {filteredTypes.map((t) => (
//                 <option key={t} value={t}>
//                   {t}
//                 </option>
//               ))}
//             </select>
//           )}

//           {hasValidRarity && (
//             <select
//               value={selectedRarity}
//               onChange={(e) => setSelectedRarity(e.target.value)}
//               disabled={isRolling}
//             >
//               <option value="">-- Chọn rarity --</option>
//               {filteredRarities.map((r) => (
//                 <option key={r} value={r}>
//                   {r}
//                 </option>
//               ))}
//             </select>
//           )}
//         </div>
//       )}

//       {/* Roll Buttons */}
//       <div className={styles.rollButtons}>
//         <button onClick={() => handleRoll(1)} disabled={isRolling}>
//           🎲 Roll 1
//         </button>
//         <button onClick={() => handleRoll(10)} disabled={isRolling}>
//           🎲 Roll 10
//         </button>
//       </div>

//       {isRolling && (
//         <div className={styles.spinnerContainer}>
//           <span className="spinner" />
//           <span>⏳ Đang roll card, vui lòng chờ...</span>
//         </div>
//       )}

//       {!isRolling && noResultWarning && (
//         <p className={styles.warningMessage}>
//           ⚠️ Không có thẻ nào phù hợp với lựa chọn hiện tại.
//         </p>
//       )}

//       {!isRolling && cards.length > 0 && (
//         <p className={styles.totalPrice}>
//           💰 Tổng giá trị (market): ${totalPrice}
//         </p>
//       )}

//       <div className={styles.cardList}>
//         <AnimatePresence>
//           {cards.filter(Boolean).map((card, index) => (
//             <motion.div
//               key={`${card.id}-${index}`} // ← bảo đảm mỗi card là unique render unit
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.2 }}
//             >
//               <CardItem card={card} index={index} />
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// export default RandomCards;


//==================================================================================================================
// RandomCards.jsx (gọi API backend lấy card nhưng bỏ hiển thị giá)
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import CardItem from "./CardItem";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./RandomCards.module.css";
import { allTypes, allRarities } from "../utils/constants";
import { Tooltip } from "react-tooltip";

const RandomCards = () => {
  const [cards, setCards] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollMode, setRollMode] = useState("all");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [noResultWarning, setNoResultWarning] = useState(false);

  const allowedTypes = JSON.parse(localStorage.getItem("allowedTypes")) || [];
  const allowedRarities = JSON.parse(localStorage.getItem("allowedRarities")) || [];

  const hasValidType = allowedTypes.length > 0;
  const hasValidRarity = allowedRarities.length > 0;

  const filteredTypes = allTypes.filter((type) => allowedTypes.includes(type));
  const filteredRarities = allRarities.filter((rarity) => allowedRarities.includes(rarity));

  const handleRoll = async (count = 1) => {
    setIsRolling(true);
    setNoResultWarning(false);
    try {
      let result = [];
      if (rollMode === "combo") {
        const res = await api.get("/Cards/search", {
          params: {
            type: selectedType || undefined,
            rarity: selectedRarity || undefined,
            limit: count
          }
        });
        result = res.data;
      } else if (rollMode === "energy") {
        const res = await api.get("/Cards/energy", { params: { limit: count } });
        result = res.data;
      } else if (rollMode === "trainer") {
        const res = await api.get("/Cards/trainer", { params: { limit: count } });
        result = res.data;
      } else {
        const res = await api.get("/Cards/random", { params: { limit: count } });
        result = res.data;
      }

      if (!result || result.length === 0) {
        setNoResultWarning(true);
      }

      await new Promise((res) => setTimeout(res, 500));
      setCards(result);
    } catch (err) {
      console.error("Lỗi khi gọi API backend:", err);
      setNoResultWarning(true);
    } finally {
      setIsRolling(false);
    }
  };

  const modes = [
    {
      id: "all",
      label: "🌐 Tất cả",
      tooltip: "Roll ngẫu nhiên từ toàn bộ thẻ trong bộ sưu tập",
    },
    ...(hasValidType || hasValidRarity
      ? [
          {
            id: "combo",
            label: "🔥 Theo Type + Rarity",
            tooltip: "Chọn loại Pokémon và độ hiếm để roll chính xác hơn",
          },
        ]
      : []),
    {
      id: "energy",
      label: "⚡ Energy",
      tooltip: "Chỉ roll các thẻ năng lượng (Energy cards)",
    },
    {
      id: "trainer",
      label: "📘 Trainer",
      tooltip: "Chỉ roll các thẻ huấn luyện (Trainer cards)",
    },
  ];

  return (
    <div>
      <h2>🎴 Pokémon Card Roll</h2>

      {/* Tabs */}
      <div className={styles.tabs}>
        {modes.map((mode) => (
          <div key={mode.id}>
            <button
              data-tooltip-id={`tooltip-${mode.id}`}
              data-tooltip-content={mode.tooltip}
              className={`roll-tab ${rollMode === mode.id ? "selected-tab" : ""}`}
              onClick={() => setRollMode(mode.id)}
            >
              {mode.label}
            </button>
            <Tooltip id={`tooltip-${mode.id}`} place="top" />
          </div>
        ))}
      </div>

      {/* Combo Mode Controls */}
      {rollMode === "combo" && (hasValidType || hasValidRarity) && (
        <div className={styles.comboControls}>
          {hasValidType && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={isRolling}
            >
              <option value="">-- Chọn type --</option>
              {filteredTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          {hasValidRarity && (
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              disabled={isRolling}
            >
              <option value="">-- Chọn rarity --</option>
              {filteredRarities.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Roll Buttons */}
      <div className={styles.rollButtons}>
        <button onClick={() => handleRoll(1)} disabled={isRolling}>🎲 Roll 1</button>
        <button onClick={() => handleRoll(10)} disabled={isRolling}>🎲 Roll 10</button>
      </div>

      {isRolling && (
        <div className={styles.spinnerContainer}>
          <span className="spinner" />
          <span>⏳ Đang roll card, vui lòng chờ...</span>
        </div>
      )}

      {!isRolling && noResultWarning && (
        <p className={styles.warningMessage}>
          ⚠️ Không có thẻ nào phù hợp với lựa chọn hiện tại.
        </p>
      )}

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
              <CardItem card={card} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RandomCards;
