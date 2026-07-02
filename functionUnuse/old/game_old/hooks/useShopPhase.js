import { useState } from "react";
import { generateShopChoices } from "./shopItems";

export function useShopPhase({
  level,
  stats,
  setStats,
  setShopSelection,
  setShopPending,
  setShopLevelShown,
  addLog,
  startNextBattle,
}) {
  const [boughtItems, setBoughtItems] = useState([]);
  const [rerollCost, setRerollCost] = useState(10);

  const handleReroll = () => {
    if (stats.gold >= rerollCost) {
      setStats((prev) => ({
        ...prev,
        gold: prev.gold - rerollCost,
      }));

      setRerollCost((prev) => Math.floor(prev * 1.5));
      setBoughtItems([]);
      const newShop = generateShopChoices(level)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setShopSelection(newShop);
    }
  };

  const handleBuy = (item) => {
    if (stats.gold < item.cost) return;
    if (boughtItems.includes(item.label)) return;

    setStats((prev) => ({
      ...prev,
      gold: prev.gold - item.cost,
      [item.key]: (prev[item.key] || 0) + item.value,
    }));

    setBoughtItems((prev) => [...prev, item.label]);
    addLog([
      {
        text: `You bought ${item.label} for ${item.cost} gold.`,
        type: "upgrade",
      },
    ]);
  };

  const handleExitShop = () => {
    setShopPending(false);
    setBoughtItems([]);
    setRerollCost(10 + Math.floor(level * 1.5));
    startNextBattle();
  };

  return {
    boughtItems,
    rerollCost,
    handleReroll,
    handleBuy,
    handleExitShop,
    setRerollCost,
  };
}
