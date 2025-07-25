import api from "./api";

export const getPokemonCards = async ({ mode, count, type, rarity }) => {
  try {
    const urlMap = {
      all: "/CardsPokemon/random",
      energy: "/CardsPokemon/energy",
      trainer: "/CardsPokemon/trainer",
      combo: "/CardsPokemon/search",
    };

    const endpoint = urlMap[mode] || urlMap.all;

    const params = { limit: count };
    if (mode === "combo") {
      params.type = type || undefined;
      params.rarity = rarity || undefined;
    }

    const res = await api.get(endpoint, { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Lỗi khi gọi API Pokémon:", err);
    return [];
  }
};
