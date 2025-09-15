import { useState, useEffect, useRef } from "react";
import { generateEnemy, getInitialStats } from "../utils/gameUtils";
import { useBattleLogs } from "./useBattleLogs";
import { useTickets } from "../../components/context/TicketContext";

export function useGameState() {
  const { earnTickets } = useTickets();

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
  const turn = useRef(1);

  const startNextBattle = () => {
    const newEnemy = generateEnemy(level);
    setEnemy(newEnemy);
    setBattleStarted(true);
    addLog([{ text: `A new ${newEnemy.name} appears!`, type: "normal" }]);
  };

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

  const endRun = () => {
    setStats((prev) => ({
      ...prev,
      health: 0,
    }));
    setGameOver(true);
  };

  // 🆕 Tạo callback gameOver
  const onGameOver = () => {
    const roundLog = [];
    // có thể thêm: reset shop, lưu kết quả, hiển thị popup...
    const gained = calculateTickets(level);
    earnTickets(gained);
    roundLog.push({ text: "Game Over!", type: "system" });
    roundLog.push(
      {
        text: `🎟️ You gained ${gained} tickets!`,
        type: "ticket",
      },
    );
    addLog(roundLog);
  };

  // 🆕 Theo dõi gameOver state
  useEffect(() => {
    if (gameOver) {
      onGameOver();
    }
  }, [gameOver]);

  return {
    level,
    setLevel,
    enemy,
    setEnemy,
    logs,
    addLog,
    clearLogs,
    stats,
    setStats,
    battleStarted,
    setBattleStarted,
    gameOver,
    setGameOver,
    pendingUpgrades,
    setPendingUpgrades,
    autoBattle,
    setAutoBattle,
    shopPending,
    setShopPending,
    shopSelection,
    setShopSelection,
    shopLevelShown,
    setShopLevelShown,
    turn,
    startNextBattle,
    restartGame,
    applyUpgrade,
    endRun,
  };
}

function calculateTickets(level) {
  if (level < 10) {
    return level;
  } else if (level < 20) {
    return Math.floor(level * 1.2);
  } else if (level < 30) {
    return Math.floor(level * 1.5);
  } else {
    return Math.floor(level * 2);
  }
}
