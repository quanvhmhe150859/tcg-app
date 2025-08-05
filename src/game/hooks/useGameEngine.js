import { useAutoBattle } from "./useAutoBattle";
import { useGameState } from "./useGameState";
import { useShopPhase } from "./useShopPhase";
import { useBattleLogic } from "./useBattleLogic";

export function useGameEngine() {
  const {
    level,
    setLevel,
    enemy,
    setEnemy,
    logs,
    addLog,
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
  } = useGameState();

  const {
    boughtItems,
    rerollCost,
    handleReroll,
    handleBuy,
    handleExitShop,
    setRerollCost,
  } = useShopPhase({
    level,
    stats,
    setStats,
    setShopSelection,
    setShopPending,
    setShopLevelShown,
    addLog,
    startNextBattle,
  });

  const { startBattle } = useBattleLogic({
    enemy,
    stats,
    turn,
    level,
    logs,
    shopPending,
    pendingUpgrades,
    setEnemy,
    setStats,
    setLevel,
    setPendingUpgrades,
    setShopPending,
    setShopSelection,
    setShopLevelShown,
    setGameOver,
    setAutoBattle,
    addLog,
    startNextBattle,
    shopLevelShown,
    setRerollCost,
  });

  useAutoBattle(
    autoBattle && !gameOver && !pendingUpgrades && !shopPending,
    [logs],
    () => startBattle(),
    125
  );

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