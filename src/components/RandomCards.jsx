import { useEffect, useState } from "react";
import axios from "axios";
import CardItem from "./CardItem";

const RandomCards = () => {
  const [cards, setCards] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [types, setTypes] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSet, setSelectedSet] = useState("");

  useEffect(() => {
    // Fetch types
    axios
      .get("https://api.pokemontcg.io/v2/types")
      .then((res) => setTypes(res.data.data))
      .catch((err) => console.error("Error fetching types", err));

    // Fetch sets
    axios
      .get("https://api.pokemontcg.io/v2/sets?pageSize=250")
      .then((res) => setSets(res.data.data))
      .catch((err) => console.error("Error fetching sets", err));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  const handleRoll = async (count = 10) => {
    try {
      const res = await axios.get(
        `https://api.pokemontcg.io/v2/cards?pageSize=${count}`
      );
      setCards(res.data.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleRollByType = async (type) => {
    try {
      const res = await axios.get(
        `https://api.pokemontcg.io/v2/cards?q=types:${type}&pageSize=10`
      );
      setCards(res.data.data);
    } catch (err) {
      console.error("Fetch by type failed", err);
    }
  };

  const handleRollBySet = async (setId) => {
    try {
      const res = await axios.get(
        `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&pageSize=10`
      );
      setCards(res.data.data);
    } catch (err) {
      console.error("Fetch by set failed", err);
    }
  };

  const totalPrice = cards.reduce((sum, card) => {
    const price =
      card.tcgplayer?.prices?.normal?.market ||
      card.tcgplayer?.prices?.holofoil?.market ||
      0;
    return sum + price;
  }, 0);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <button
        onClick={toggleDarkMode}
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          background: "transparent",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <h1 style={{ textAlign: "center" }}>🎲 Pokémon TCG - Roll Cards</h1>

      <div style={{ textAlign: "center", margin: "1rem" }}>
        {/* Type Roll */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">-- Chọn Type --</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleRollByType(selectedType)}
          disabled={!selectedType}
        >
          Roll theo Type
        </button>

        {/* Set Roll */}
        <select
          value={selectedSet}
          onChange={(e) => setSelectedSet(e.target.value)}
        >
          <option value="">-- Chọn Set --</option>
          {sets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleRollBySet(selectedSet)}
          disabled={!selectedSet}
        >
          Roll theo Set
        </button>
      </div>

      {/* Roll */}
      <div style={{ textAlign: "center", margin: "1rem" }}>
        <button onClick={() => handleRoll(1)} style={{ marginRight: "1rem" }}>
          Roll 1
        </button>
        <button onClick={() => handleRoll(10)}>Roll 10</button>
      </div>

      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            darkMode={darkMode}
          />
        ))}
      </div>

      <h3 style={{ textAlign: "center" }}>
        💰 Tổng giá trị: ${totalPrice.toFixed(2)}
      </h3>
    </div>
  );
};

export default RandomCards;
