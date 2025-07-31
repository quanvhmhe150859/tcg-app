import { useState, useRef } from "react";
import { generateEnemy, getRandomInt, upgradeOptions } from "../utils/gameUtils";
import { useAutoBattle } from "./useAutoBattle";
import { useBattleLogs } from "./useBattleLogs";

export function useGameEngine() {
  const [level, setLevel] = useState(1);
  const [enemy, setEnemy] = useState(null);
  const { logs, addLog, clearLogs } = useBattleLogs();
  const getInitialStats = () => ({
    health: 100,
    armor: 20,
    dodge: 10,
    minAttack: 1,
    maxAttack: 10,
    regen: 2,
    lifeSteal: 5,
    critChance: 10
  });

  const [stats, setStats] = useState(getInitialStats);
  const [battleStarted, setBattleStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pendingUpgrades, setPendingUpgrades] = useState(null);
  const [autoBattle, setAutoBattle] = useState(false);

  useAutoBattle(autoBattle && !gameOver && !pendingUpgrades, [logs], () => startBattle(), 125);

  const restartGame = () => {
    setLevel(1);
    setStats(getInitialStats());
    setEnemy(null);
    clearLogs();
    setBattleStarted(false);
    setGameOver(false);
    setPendingUpgrades(null);
    setAutoBattle(false);
  };

  const applyUpgrade = (upgrade) => {
    setStats(prev => ({
      ...prev,
      [upgrade.key]: prev[upgrade.key] + upgrade.value
    }));
    setPendingUpgrades(null);
    const newEnemy = generateEnemy(level);
    setEnemy(newEnemy);
    addLog([{ text: `A new ${newEnemy.name} appears!`, type: "normal" }]);
  };

  const applyDamage = (target, damage) => {
    const result = { ...target };
    if (target.armor >= damage) return result;
    const effectiveDamage = damage - target.armor;
    result.health -= effectiveDamage;
    return result;
  };

  const didDodge = (dodgeChance) => Math.random() * 100 < dodgeChance;

  const startBattle = () => {
    if (!enemy && !pendingUpgrades) {
      setEnemy(generateEnemy(level));
      setBattleStarted(true);
    } else if (!pendingUpgrades) {
      const roundLog = [];
      let newEnemy = { ...enemy };
      let newStats = { ...stats };

      if (newStats.regen > 0) {
        newStats.health += newStats.regen;
        roundLog.push({ text: `Player regenerates ${newStats.regen} HP.`, type: "heal" });
      }
      let playerDmg = getRandomInt(stats.minAttack, stats.maxAttack);
      const isCrit = Math.random() * 100 < stats.critChance;
      if (isCrit) {
        playerDmg *= 2;
        roundLog.push({ text: `Player lands a CRITICAL hit for ${playerDmg} damage!`, type: "crit" });
      } else {
        roundLog.push({ text: `Player hits ${newEnemy.name} for ${playerDmg} damage.`, type: "normal" });
      }

      if (newEnemy.armor >= playerDmg) {
        roundLog.push({ text: `${newEnemy.name}'s armor blocked the damage!`, type: "normal" });
      } else {
        newEnemy = applyDamage(newEnemy, playerDmg);
        const heal = Math.floor((playerDmg * stats.lifeSteal) / 100);
        if (heal > 0) {
          newStats.health += heal;
          roundLog.push({ text: `Player heals for ${heal} HP with life steal.`, type: "heal" });
        }
      }
      if (newEnemy.health <= 0) {
        roundLog.push({ text: `${newEnemy.name} is defeated!`, type: "defeat" });
        const nextLevel = level + 1;
        setLevel(nextLevel);
        const shuffled = upgradeOptions.sort(() => 0.5 - Math.random());
        setPendingUpgrades(shuffled.slice(0, 3));
      } else {
        const enemyDmg = getRandomInt(enemy.minAttack, enemy.maxAttack);
        if (didDodge(newStats.dodge)) {
          roundLog.push({ text: "Player dodged the attack!", type: "heal" });
        } else if (newStats.armor >= enemyDmg) {
          roundLog.push({ text: `Player's armor blocked the damage!`, type: "normal" });
        } else {
          newStats = applyDamage(newStats, enemyDmg);
          roundLog.push({ text: `${enemy.name} hits player for ${enemyDmg} damage.`, type: "normal" });
        }
        if (newStats.health <= 0) {
          roundLog.push({ text: "Player is defeated. Game Over.", type: "defeat" });
          setGameOver(true);
          setAutoBattle(false);
        }
      }

      setStats(newStats);
      setEnemy(newEnemy);
      addLog(roundLog);
    }
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
    setAutoBattle
  };
}
