import { useEffect, useState } from "react";
import axios from "axios";

const RandomCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const TOTAL_CARDS = 18000; // hoặc fetch động

  const fetchRandomCards = async (count = 1) => {
    setLoading(true);
    try {
      const randomOffset = Math.floor(Math.random() * (TOTAL_CARDS - count));
      const response = await axios.get("https://api.pokemontcg.io/v2/cards", {
        params: {
          pageSize: count,
          page: Math.floor(randomOffset / count) + 1,
        },
        headers: {
          // "X-Api-Key": "YOUR_API_KEY_HERE"
        },
      });

      setCards(response.data.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomCards(1); // Load 1 thẻ lúc đầu
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🎴 Random Pokémon Cards</h2>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => fetchRandomCards(1)} style={{ marginRight: "1rem" }}>
          🔁 Random 1 Card
        </button>
        <button onClick={() => fetchRandomCards(10)}>🔁 Random 10 Cards</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
        }}>
          {cards.map(card => (
            <div key={card.id}>
              <img
                src={card.images.large}
                alt={card.name}
                width="200"
                style={{ borderRadius: "8px" }}
              />
              <p>{card.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RandomCards;
