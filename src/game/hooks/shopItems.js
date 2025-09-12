// Danh sách chỉ số shop cơ bản (giá trị cố định, không scale)
export const baseShopItems = [
  { key: "health", value: 1000, cost: 120 },
  { key: "regen", value: 5, cost: 70 },
  { key: "minAttack", value: 5, cost: 30 },
  { key: "maxAttack", value: 5, cost: 30 },
  { key: "armor", value: 5, cost: 40 },
  { key: "dodge", value: 3, cost: 90 },
  { key: "critChance", value: 5, cost: 70 },
  { key: "lifeSteal", value: 5, cost: 60 },
];

// Hàm sinh ra danh sách shop tương ứng với level hiện tại
export const generateShopChoices = (level) => {
  const scale = Math.pow(level, 1.4);

  return baseShopItems.map((item) => {
    const cost = Math.floor(item.cost + scale); // scale cost theo level

    const suffix = ["critChance", "lifeSteal","dodge"].includes(item.key) ? "%" : "";
    const label = `+${item.value}${suffix} ${formatKey(item.key)}`;

    return {
      key: item.key,
      value: item.value,
      cost,
      label,
    };
  });
};

// Chuyển key thành label đẹp hơn
const formatKey = (key) => {
  switch (key) {
    case "critChance":
      return "Crit Chance";
    case "lifeSteal":
      return "Life Steal";
    case "minAttack":
      return "Min Attack";
    case "maxAttack":
      return "Max Attack";
    default:
      return key.charAt(0).toUpperCase() + key.slice(1);
  }
};
