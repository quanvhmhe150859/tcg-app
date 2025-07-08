import { useEffect, useState } from "react";

export default function YugiohRoll() {
  const [allCards, setAllCards] = useState([]);
  const [rolledCards, setRolledCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Gọi API 1 lần để lấy toàn bộ danh sách bài
  useEffect(() => {
    fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php")
      .then((res) => res.json())
      .then((data) => {
        setAllCards(data.data);
      });
  }, []);

  const getRandomCards = (count) => {
    if (allCards.length === 0) return [];

    const result = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      result.push(allCards[randomIndex]);
    }
    return result;
  };

  const handleRoll = (count) => {
    setLoading(true);
    setTimeout(() => {
      const newCards = getRandomCards(count);
      setRolledCards(newCards);
      setLoading(false);
    }, 300); // hiệu ứng loading nhẹ
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🎴 Roll bài Yu-Gi-Oh!</h1>
      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => handleRoll(1)} disabled={loading}>
          Roll 1
        </button>
        <button onClick={() => handleRoll(10)} disabled={loading} style={{ marginLeft: "1rem" }}>
          Roll 10
        </button>
      </div>

      {loading && <p>⏳ Đang roll...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
        {rolledCards.map((card) => (
          <div key={card.id} style={{ width: "150px", textAlign: "center" }}>
            <img
              src={card.card_images?.[0]?.image_url}
              alt={card.name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
            <div style={{ marginTop: "0.5rem" }}>{card.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
