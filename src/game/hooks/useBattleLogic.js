import {
  startTurn,
  playerTurn,
  enemyTurn,
  checkDefeatedPhase,
  endTurnPhase,
} from "../battle";
import { getRandomInt, applyDamage, didDodge, upgradeOptions, bossEffectOptions } from "../utils/gameUtils";
import { generateShopChoices } from "./shopItems";

export function useBattleLogic({
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
  earnTickets,
}) {
  const startBattle = () => {
    if (pendingUpgrades || shopPending) return;

    if (!enemy) {
      startNextBattle();
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
      earnTickets,
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

    if (enemyResult.defeatedResult?.defeated === "player") {
      setStats(newStats);
      setEnemy(newEnemy);
      addLog(roundLog);
      return;
    }

    endTurnPhase();

    setStats(newStats);
    setEnemy(newEnemy);
    addLog(roundLog);
  };

  return { startBattle };
}