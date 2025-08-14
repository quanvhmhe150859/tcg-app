import api from "../../utils/api";

const yugiohCache = new Map();
let cachedCardSets = null;

export const getAllCardSets = async () => {
  if (cachedCardSets) return cachedCardSets;

  try {
    const res = await api.get("/api/cardsyugioh/cardsets");
    const mapped = res.data.map((item) => ({
      value: item.setName,
      label: item.displayName,
    }));

    cachedCardSets = mapped; // ✅ Lưu cache trong RAM
    return mapped;
  } catch (error) {
    console.error("Lỗi khi gọi API cardsets:", error);
    throw error;
  }
};

export const getCardsRandom = async (limit, setName, cardType) => {
  const res = await api.get("/api/cardsyugioh/roll-random", {
    params: {
      limit,
      setName: setName || undefined,
      cardType: cardType || undefined,
    },
  });
  return Array.isArray(res.data) ? res.data.slice(0, 10) : [];
};

export const getCardsByRarities = async (rarities, cardType = null, setName = null) => {
  const query = [
    ...rarities.map((r) => `rarity=${encodeURIComponent(r)}`),
    ...(cardType ? [`cardType=${encodeURIComponent(cardType)}`] : []),
    ...(setName ? [`setName=${encodeURIComponent(setName)}`] : []),
    `limit=${rarities.length}`,
  ].join("&");

  const res = await api.get(`/api/cardsyugioh/roll-fixed?${query}`);
  return Array.isArray(res.data) ? res.data.slice(0, 10) : [];
};


export function rollWithWeight(weightMap) {
  const entries = Object.entries(weightMap).map(([rarity, weight]) => ({
    rarity,
    weight: Number(weight),
  }));

  const total = entries.reduce((sum, r) => sum + r.weight, 0);
  const rand = Math.random() * total;
  let acc = 0;

  for (let r of entries) {
    acc += r.weight;
    if (rand < acc) return r.rarity;
  }

  return entries[entries.length - 1]?.rarity ?? "Unknown";
}

export const getRaritiesInPack = async (setName = null, cardType = null) => {
  const query = [];

  if (setName) query.push(`setName=${encodeURIComponent(setName)}`);
  if (cardType) query.push(`cardType=${encodeURIComponent(cardType)}`);

  if (query.length === 0) {
    throw new Error("Phải truyền ít nhất setName hoặc cardType");
  }

  const res = await api.get(`/api/cardsyugioh/rarities-in-pack?${query.join("&")}`);
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Lấy danh sách archetypes Yu-Gi-Oh!
 */
export async function fetchYugiohArchetypes() {
  const cacheKey = "archetypes";
  if (yugiohCache.has(cacheKey)) {
    return yugiohCache.get(cacheKey);
  }
  const res = await api.get("/api/CardsYugioh/archetypes");
  yugiohCache.set(cacheKey, res.data);
  return res.data;
}

/**
 * Lấy danh sách card Yu-Gi-Oh! với filter
 */
export async function fetchYugiohCards(params) {
  const cacheKey = JSON.stringify(params);
  if (yugiohCache.has(cacheKey)) {
    return yugiohCache.get(cacheKey);
  }

  const res = await api.get("/api/CardsYugioh", {
    params: {
      name: params.name,
      page: params.page,
      pageSize: params.pageSize || 10,
      type: params.type || undefined,
      archetype: params.archetype || undefined,
      attribute: params.attribute || undefined,
      atkMin: params.atkMin || undefined,
      atkMax: params.atkMax || undefined,
      defMin: params.defMin || undefined,
      defMax: params.defMax || undefined,
      levelMin: params.levelMin || undefined,
      levelMax: params.levelMax || undefined,
      orderField: params.orderField,
      orderBy: params.orderBy,
    },
  });

  yugiohCache.set(cacheKey, res.data);
  return res.data;
}