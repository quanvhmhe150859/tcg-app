import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminSettings = ({ darkMode }) => {
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);

  const [allowedTypes, setAllowedTypes] = useState([]);
  const [allowedRarities, setAllowedRarities] = useState([]);

  const [typeSearch, setTypeSearch] = useState("");
  const [raritySearch, setRaritySearch] = useState("");

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    axios
      .get("https://api.pokemontcg.io/v2/types")
      .then((res) => setTypes(res.data.data.sort()))
      .catch(console.error);

    axios
      .get("https://api.pokemontcg.io/v2/rarities")
      .then((res) => setRarities(res.data.data.sort()))
      .catch(console.error);

    const savedTypes = JSON.parse(localStorage.getItem("allowedTypes") || "[]");
    const savedRarities = JSON.parse(
      localStorage.getItem("allowedRarities") || "[]"
    );

    setAllowedTypes(savedTypes);
    setAllowedRarities(savedRarities);
  }, []);

  const toggleItem = (value, group, setter) => {
    setter((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      setIsChanged(true);
      return updated;
    });
  };

  const handleSave = () => {
    localStorage.setItem("allowedTypes", JSON.stringify(allowedTypes));
    localStorage.setItem("allowedRarities", JSON.stringify(allowedRarities));
    setIsChanged(false);
    alert("Đã lưu cấu hình thành công!");
  };

  const filteredTypes = types.filter((t) =>
    t.toLowerCase().includes(typeSearch.toLowerCase())
  );
  const filteredRarities = rarities.filter((r) =>
    r.toLowerCase().includes(raritySearch.toLowerCase())
  );

  return (
    <div
      className={darkMode ? "dark-container" : "light-container"}
      style={{ padding: "2rem", background: "transparent" }}
    >
      <h2>⚙️ Admin Settings</h2>

      <div style={{ marginBottom: "2rem" }}>
        <h3>🔥 Chọn các Type được phép roll</h3>
        <input
          type="text"
          placeholder="Tìm kiếm type..."
          value={typeSearch}
          onChange={(e) => setTypeSearch(e.target.value)}
          style={{ marginBottom: "0.5rem", width: "100%" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {filteredTypes.map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                checked={allowedTypes.includes(type)}
                onChange={() => toggleItem(type, allowedTypes, setAllowedTypes)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3>🌟 Chọn các Rarity được phép roll</h3>
        <input
          type="text"
          placeholder="Tìm kiếm rarity..."
          value={raritySearch}
          onChange={(e) => setRaritySearch(e.target.value)}
          style={{ marginBottom: "0.5rem", width: "100%" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {filteredRarities.map((rarity) => (
            <label key={rarity}>
              <input
                type="checkbox"
                checked={allowedRarities.includes(rarity)}
                onChange={() =>
                  toggleItem(rarity, allowedRarities, setAllowedRarities)
                }
              />
              {rarity}
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={!isChanged}>
        💾 Lưu cấu hình
      </button>
    </div>
  );
};

export default AdminSettings;
