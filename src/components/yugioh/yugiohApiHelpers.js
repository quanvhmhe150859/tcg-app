import api from "../../utils/api";

export const getAllCardSets = async () => {
  const res = await api.get("/api/cardsyugioh/cardsets");
  return res.data.map((item) => ({
    value: item.setName,
    label: item.displayName,
  }));
};

export const getCardsFromSet = async (limit, setName) => {
  const res = await api.get("/api/cardsyugioh/cards", {
    params: {
      limit,
      set: setName || undefined,
    },
  });
  return Array.isArray(res.data) ? res.data.slice(0, 10) : [];
};

export const getCardsByRarities = async (rarities, cardType = null) => {
  const query = [
    ...rarities.map((r) => `rarity=${encodeURIComponent(r)}`),
    ...(cardType ? [`cardType=${encodeURIComponent(cardType)}`] : []),
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
