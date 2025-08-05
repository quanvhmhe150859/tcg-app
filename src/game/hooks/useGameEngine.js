import { useState, useRef } from "react";
import {
  generateEnemy,
  getRandomInt,
  upgradeOptions,
  bossEffectOptions,
  getInitialStats,
  applyDamage,
  didDodge,
} from "../utils/gameUtils";
import { useAutoBattle } from "./useAutoBattle";
import { useBattleLogs } from "./useBattleLogs";
import {
  startTurn,
  playerTurn,
  enemyTurn,
  endTurnPhase,
  checkDefeatedPhase,
} from "./battlePhases";
import { generateShopChoices } from "./shopItems";

export function useGameEngine() {
  const [level, setLevel] = useState(1);
  const [enemy, setEnemy] = useState(null);
  const { logs, addLog, clearLogs } = useBattleLogs();
  const [stats, setStats] = useState(() => ({
    ...getInitialStats(),
    effects: { burn: 0, poison: 0, stun: 0 },
  }));
  const [battleStarted, setBattleStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pendingUpgrades, setPendingUpgrades] = useState(null);
  const [autoBattle, setAutoBattle] = useState(false);

  const [shopPending, setShopPending] = useState(false);
  const [shopSelection, setShopSelection] = useState([]);
  const [shopLevelShown, setShopLevelShown] = useState(null);
  const [boughtItems, setBoughtItems] = useState([]);
  const [rerollCost, setRerollCost] = useState(10);

  const turn = useRef(1);

  useAutoBattle(
    autoBattle && !gameOver && !pendingUpgrades && !shopPending,
    [logs],
    () => startBattle(),
    125
  );

  const restartGame = () => {
    setLevel(1);
    setStats({
      ...getInitialStats(),
      effects: { burn: 0, poison: 0, stun: 0 },
    });
    setEnemy(null);
    clearLogs();
    setBattleStarted(false);
    setGameOver(false);
    setPendingUpgrades(null);
    setAutoBattle(false);
    setBoughtItems([]);
    setShopPending(false);
    setShopSelection([]);
    setShopLevelShown(null);
  };

  const applyUpgrade = (upgrade) => {
    if (upgrade.key === "effect") {
      setStats((prev) => ({
        ...prev,
        effects: {
          ...prev.effects,
          [upgrade.value]: (prev.effects[upgrade.value] || 0) + 1,
        },
      }));
    } else {
      setStats((prev) => ({
        ...prev,
        [upgrade.key]:
          upgrade.key === "dodge"
            ? Math.min(prev.dodge + upgrade.value, 60)
            : prev[upgrade.key] + upgrade.value,
      }));
    }
    setPendingUpgrades(null);
    startNextBattle();
  };

  const handleReroll = () => {
    if (stats.gold >= rerollCost) {
      // Trừ tiền
      setStats((prev) => ({
        ...prev,
        gold: prev.gold - rerollCost,
      }));

      // Tăng giá reroll cho lần sau
      setRerollCost((prev) => Math.floor(prev * 1.5));
      // Xóa các item đã mua
      setBoughtItems([]);
      // Reroll shop mới
      const newShop = generateShopChoices(level)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setShopSelection(newShop);
    }
  };

  const handleExitShop = () => {
    setShopPending(false);
    setBoughtItems([]);
    setRerollCost(10 + Math.floor(level * 1.5)); // Reset reroll cost
    startNextBattle();
  };

  const startNextBattle = () => {
    const newEnemy = generateEnemy(level);
    setEnemy(newEnemy);
    setBattleStarted(true);
    addLog([{ text: `A new ${newEnemy.name} appears!`, type: "normal" }]);
  };

  const handleBuy = (item) => {
    if (stats.gold < item.cost) return;
    if (boughtItems.includes(item.label)) return; // ✅ đã mua rồi

    setStats((prev) => ({
      ...prev,
      gold: prev.gold - item.cost,
      [item.key]: (prev[item.key] || 0) + item.value,
    }));

    setBoughtItems((prev) => [...prev, item.label]); // ✅ đánh dấu đã mua

    addLog([
      {
        text: `You bought ${item.label} for ${item.cost} gold.`,
        type: "upgrade",
      },
    ]);
  };

  const startBattle = () => {
    if (pendingUpgrades || shopPending) return;

    if (!enemy) {
      setEnemy(generateEnemy(level));
      setBattleStarted(true);
      return;
    }

    const roundLog = [];
    let newEnemy = { ...enemy };
    let newStats = startTurn(stats, turn, roundLog);

    const defeatArgs = {
      level,
      turn,
      setLevel,
      setPendingUpgrades,
      setShopPending,
      setShopSelection,
      setShopLevelShown,
      setGameOver,
      setAutoBattle,
      upgradeOptions,
      bossEffectOptions,
      shopLevelShown,
      generateShopChoices,
      setRerollCost,
    };

    const playerResult = playerTurn(
      newStats,
      newEnemy,
      getRandomInt,
      applyDamage,
      roundLog,
      checkDefeatedPhase,
      defeatArgs
    );
    newStats = playerResult.newStats;
    newEnemy = playerResult.newEnemy;

    // Nếu enemy chết, dừng tại đây
    if (playerResult.defeatedResult?.defeated === "enemy") {
      setStats(newStats);
      setEnemy(newEnemy);
      addLog(roundLog);
      return;
    }

    const enemyResult = enemyTurn(
      newStats,
      newEnemy,
      turn,
      getRandomInt,
      applyDamage,
      didDodge,
      roundLog,
      checkDefeatedPhase,
      defeatArgs
    );
    newStats = enemyResult.newStats;
    newEnemy = enemyResult.newEnemy;

    if (!enemyResult.stunned) {
      turn.current += 1;
    }

    // Nếu player chết, dừng tại đây
    if (enemyResult.defeatedResult?.defeated === "player") {
      setStats(newStats);
      setEnemy(newEnemy);
      addLog(roundLog);
      return;
    }

    // End turn phase (chưa làm gì)
    endTurnPhase();

    setStats(newStats);
    setEnemy(newEnemy);
    addLog(roundLog);
  };

  return {
    level,
    enemy,
    logs,
    stats,
    battleStarted,
    gameOver,
    pendingUpgrades,
    autoBattle,
    startBattle,
    restartGame,
    applyUpgrade,
    setAutoBattle,
    shopPending,
    shopSelection,
    handleBuy,
    boughtItems,
    handleExitShop,
    handleReroll,
    rerollCost,
  };
}
