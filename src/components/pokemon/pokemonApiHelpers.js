import api from "../../utils/api";

const pokemonCache = new Map();

export const getPokemonCards = async ({ count, type, rarity, superType }) => {
  try {
    const params = { limit: count };
    params.type = type || undefined;
    params.rarity = rarity || undefined;
    params.superType = superType || undefined;

    const res = await api.get("api/CardsPokemon/search", { params });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Lỗi khi gọi API Pokémon:", err);
    return [];
  }
};

export async function fetchPokemonCards({
  name,
  page,
  pageSize = 10,
  superType,
  rarity,
  type,
  dexNumber,
  orderBy,
}) {
  // Tạo cache key duy nhất dựa trên toàn bộ tham số
  const cacheKey = JSON.stringify({
    name,
    page,
    pageSize,
    superType,
    rarity,
    type,
    dexNumber,
    orderBy,
  });

  // Nếu có trong cache → trả về luôn
  if (pokemonCache.has(cacheKey)) {
    return pokemonCache.get(cacheKey);
  }

  // Không có trong cache → gọi API
  const res = await api.get("/api/CardsPokemon", {
    params: {
      name,
      page,
      pageSize,
      superType: superType || undefined,
      rarity: rarity || undefined,
      type: type || undefined,
      dexNumber: dexNumber || undefined,
      orderBy,
    },
  });

  // Lưu vào cache
  pokemonCache.set(cacheKey, res.data);

  return res.data;
}
