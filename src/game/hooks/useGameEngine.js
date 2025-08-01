import { useState, useRef } from "react";
import {
  generateEnemy,
  getRandomInt,
  upgradeOptions,
  bossEffectOptions,
  getInitialStats,
  applyStatusEffects,
} from "../utils/gameUtils";
import { useAutoBattle } from "./useAutoBattle";
import { useBattleLogs } from "./useBattleLogs";

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

  const applyDamage = (target, damage) => {
    const result = { ...target };

    const reductionRatio = 100 / (100 + target.armor); // nếu armor = 0 → full damage
    const effectiveDamage = Math.ceil(damage * reductionRatio);

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

      roundLog.push({
        text: `Turn ${turn.current}`,
        type: "normal",
      });

      let newEnemy = { ...enemy };
      let newStats = { ...stats };

      if (newStats.regen > 0) {
        newStats.health += newStats.regen;
        roundLog.push({
          text: `Player regenerates ${newStats.regen} HP.`,
          type: "heal",
        });
      }
      let baseDmg = getRandomInt(stats.minAttack, stats.maxAttack);
      const isCrit = Math.random() * 100 < stats.critChance;
      if (isCrit) baseDmg *= 2;

      const beforeHP = newEnemy.health;
      newEnemy = applyDamage(newEnemy, baseDmg);
      const actualDamage = beforeHP - newEnemy.health;

      roundLog.push({
        text: `Player hits ${newEnemy.name}: ${actualDamage}(${baseDmg}) damage.`,
        type: isCrit ? "crit" : "normal",
      });

      const heal = Math.floor((baseDmg * stats.lifeSteal) / 100);
      if (heal > 0) {
        newStats.health += heal;
        roundLog.push({
          text: `Player heals for ${heal} HP with life steal.`,
          type: "heal",
        });
      }

      // Apply effects
      const {
        updatedTarget: updatedEnemy,
        stunned,
        log: effectLog,
      } = applyStatusEffects(newStats.effects, newEnemy, turn.current);
      newEnemy = updatedEnemy;
      roundLog.push(...effectLog);

      if (stunned) {
        setStats(newStats);
        setEnemy(newEnemy);
        addLog(roundLog);
        return;
      }

      if (newEnemy.health <= 0) {
        turn.current = 1;

        roundLog.push({
          text: `${newEnemy.name} is defeated!`,
          type: "defeat",
        });
        const nextLevel = level + 1;
        setLevel(nextLevel);

        if (enemy.isBoss) {
          setPendingUpgrades(bossEffectOptions);
        } else {
          const shuffled = upgradeOptions
            .filter((opt) => {
              if (opt.key === "minAttack" && stats.minAttack >= stats.maxAttack)
                return false;
              return true;
            })
            .sort(() => 0.5 - Math.random());

          setPendingUpgrades(shuffled.slice(0, 3));
        }
      } else {
        turn.current += 1;

        const enemyDmg = getRandomInt(enemy.minAttack, enemy.maxAttack);
        if (didDodge(newStats.dodge)) {
          roundLog.push({ text: "Player dodged the attack!", type: "heal" });
        } else {
          const beforeHP = newStats.health;
          newStats = applyDamage(newStats, enemyDmg);
          const actualDamage = beforeHP - newStats.health;

          roundLog.push({
            text: `${enemy.name} hits player: ${actualDamage}(${enemyDmg}) damage.`,
            type: "normal",
          });
        }
        if (newStats.health <= 0) {
          turn.current = 1;

          roundLog.push({
            text: "Player is defeated. Game Over.",
            type: "defeat",
          });
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
    setAutoBattle,
  };
}
