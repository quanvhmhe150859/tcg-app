import { useEffect, useState } from "react";
import axios from "axios";
import RarityIcon from "./RarityIcon";

const TYPE_OPTIONS = ["Fire", "Water", "Grass", "Psychic", "Fighting", "Lightning", "Metal", "Darkness", "Fairy", "Dragon", "Colorless"];

const RandomCards = () => {
  const [allIds, setAllIds] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  // 🔄 Tải toàn bộ ID thẻ (1 lần duy nhất)
  const fetchAllCardIds = async () => {
    try {
      const pageSize = 250;
      let page = 1;
      let finished = false;
      let ids = [];

      while (!finished) {
        const res = await axios.get("https://api.pokemontcg.io/v2/cards", {
          params: { pageSize, page },
        });
        const data = res.data.data;

        if (data.length === 0) {
          finished = true;
        } else {
          ids.push(...data.map((card) => ({ id: card.id, types: card.types || [] })));
          page++;
        }

        // 💡 Giới hạn để không gọi quá lâu trong demo
        if (page > 20) finished = true; // lấy ~5k cards
      }

      setAllIds(ids);
    } catch (error) {
      console.error("Error fetching card IDs:", error);
    }
  };

  const getRandomIds = (count = 1, typeFilter = "") => {
    const filtered = typeFilter
      ? allIds.filter((c) => c.types.includes(typeFilter))
      : allIds;

    if (filtered.length === 0) return [];

    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((c) => c.id);
  };

  const fetchRandomCards = async (count = 1) => {
    setLoading(true);
    try {
      const ids = getRandomIds(count, filterType);
      if (ids.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }

      const res = await axios.get("https://api.pokemontcg.io/v2/cards", {
        params: {
          q: `id:${ids.join(" OR id:")}`,
        },
      });

      setCards(res.data.data);
    } catch (error) {
      console.error("Error fetching random cards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCardIds();
  }, []);

  useEffect(() => {
    if (allIds.length > 0) {
      fetchRandomCards(1);
    }
  }, [allIds, filterType]);

  const getRarityStyle = (rarity) => {
    switch ((rarity || "").toLowerCase()) {
      case "common":
        return {
          color: "#444",
          background: "#e0e0e0",
          padding: "2px 6px",
          borderRadius: "4px",
        };
      case "uncommon":
        return {
          color: "#fff",
          background: "#4caf50",
          padding: "2px 6px",
          borderRadius: "4px",
        };
      case "rare":
        return {
          color: "#fff",
          background: "#1976d2",
          padding: "2px 6px",
          borderRadius: "4px",
        };
      case "ultra rare":
      case "rare holo":
      case "rare holo ex":
      case "rare ultra":
        return {
          color: "#fff",
          background: "linear-gradient(90deg, #f50057, #ff9800)",
          padding: "2px 6px",
          borderRadius: "4px",
          animation: "glow 1.5s infinite alternate",
        };
      default:
        return {
          color: "#666",
          background: "#ddd",
          padding: "2px 6px",
          borderRadius: "4px",
        };
    }
  };

  const getRarityInfo = (rarity) => {
    const r = (rarity || "").toLowerCase();
    if (r.includes("ultra") || r.includes("holo")) {
      return { icon: "🌟", tooltip: "Thẻ siêu hiếm, thường có hiệu ứng đặc biệt hoặc hologram." };
    }
    if (r === "rare") {
      return { icon: "⭐", tooltip: "Thẻ khó kiếm, thường có giá trị cao hơn." };
    }
    if (r === "uncommon") {
      return { icon: "◆", tooltip: "Thẻ hiếm hơn Common, có kỹ năng tốt hơn." };
    }
    if (r === "common") {
      return { icon: "⚪", tooltip: "Thẻ phổ biến, dễ tìm thấy." };
    }
    return { icon: "❓", tooltip: "Độ hiếm không xác định." };
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🎴 Pokémon TCG Randomizer</h2>

      {/* 🔍 Bộ lọc loại */}
      <div style={{ margin: "1rem" }}>
        <label>Filter by Type: </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">-- All Types --</option>
          {TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* 🔘 Nút Random */}
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => fetchRandomCards(1)} style={{ marginRight: "1rem" }}>
          🔁 Random 1 Card
        </button>
        <button onClick={() => fetchRandomCards(10)}>🔁 Random 10 Cards</button>
      </div>

      {/* 📦 Hiển thị thẻ */}
      {loading ? (
        <p>Loading...</p>
      ) : cards.length === 0 ? (
        <p>No cards found.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {cards.map((card) => {
            const { icon, tooltip } = getRarityInfo(card.rarity);
            const marketPrice =
              card.tcgplayer?.prices?.normal?.market?.toFixed(2) ||
              card.tcgplayer?.prices?.holofoil?.market?.toFixed(2) ||
              "N/A";

            return (
              <div
                key={card.id}
                style={{
                  width: "200px",
                  background: "#fff",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={card.images.large}
                  alt={card.name}
                  width="100%"
                  style={{ borderRadius: "4px" }}
                />
                <h4>{card.name}</h4>

                <p style={{ fontSize: "0.9rem", margin: "0.2rem" }}>
                  <strong>Set:</strong> {card.set.name}
                </p>

                <p style={{ fontSize: "0.9rem", margin: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <strong>Rarity:</strong>
                  <RarityIcon rarity={card.rarity} />
                  <span style={getRarityStyle(card.rarity)}>
                    {card.rarity || "Unknown"}
                  </span>
                </p>


                <p style={{ fontSize: "0.9rem", margin: "0.2rem" }}>
                  <strong>Type:</strong>{" "}
                  {(card.types || []).join(", ")}
                </p>

                <p style={{ fontSize: "0.9rem", margin: "0.2rem" }}>
                  <strong>Price:</strong> ${marketPrice}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RandomCards;
