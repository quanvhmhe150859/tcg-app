import api from "../../utils/api";

export const getPokemonCards = async ({ count, type, rarity, superType }) => {
  try {
    const params = { limit: count };
    params.type = type || undefined;
    params.rarity = rarity || undefined;
    params.superType = superType || undefined;

    const res = await api.get("/CardsPokemon/search", { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Lỗi khi gọi API Pokémon:", err);
    return [];
  }
};
