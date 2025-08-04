import { useState, useRef } from "react";
import {
  generateEnemy,
  getRandomInt,
  upgradeOptions,
  bossEffectOptions,
  getInitialStats,
  applyStatusEffects,
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

  const turn = useRef(1);

  useAutoBattle(
    autoBattle && !gameOver && !pendingUpgrades,
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
    const newEnemy = generateEnemy(level);
    setEnemy(newEnemy);
    addLog([{ text: `A new ${newEnemy.name} appears!`, type: "normal" }]);
  };

  const startBattle = () => {
    if (!enemy && !pendingUpgrades) {
      setEnemy(generateEnemy(level));
      setBattleStarted(true);
      return;
    }
    if (pendingUpgrades) return;

    const roundLog = [];
    let newEnemy = { ...enemy };
    let newStats = startTurn(stats, turn, roundLog);

    const defeatArgs = {
      level,
      turn,
      setLevel,
      setPendingUpgrades,
      setGameOver,
      setAutoBattle,
      upgradeOptions,
      bossEffectOptions,
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
  };
}
