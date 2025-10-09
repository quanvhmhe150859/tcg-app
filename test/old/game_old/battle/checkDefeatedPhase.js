// Phase 4: Check Defeated (tách riêng)
export const checkDefeatedPhase = (
  stats,
  enemy,
  roundLog,
  {
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
  }
) => {
  if (enemy.health <= 0) {
    turn.current = 1;
    roundLog.push({ text: `${enemy.name} is defeated!`, type: "defeat" });

    // 🟡 Thưởng tiền
    const goldGained = enemy.goldReward || 0;
    stats.gold = (stats.gold || 0) + goldGained;
    roundLog.push({
      text: `You gained ${goldGained} 💰.`,
      type: "gold",
    });

    const nextLevel = level + 1;
    setLevel(nextLevel);

    // ✅ Nếu là chuẩn bị gặp boss (level % 10 === 0)
    if (nextLevel % 10 === 0 && shopLevelShown !== nextLevel) {
      const shopChoices = generateShopChoices(nextLevel);
      setShopSelection(shopChoices.sort(() => 0.5 - Math.random()).slice(0, 3));
      setShopPending(true);
      setShopLevelShown(nextLevel);
    } else {
      // ✅ Nếu không thì mở nâng cấp như thường
      const upgrades = enemy.isBoss
        ? bossEffectOptions.sort(() => 0.5 - Math.random()).slice(0, 3)
        : upgradeOptions
            .filter((opt) => {
              if (opt.key === "minAttack" && stats.minAttack >= stats.maxAttack)
                return false;
              return true;
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

      setPendingUpgrades(upgrades);
    }
    return { defeated: "enemy" };
  }

  if (stats.health <= 0) {
    turn.current = 1;
    roundLog.push({ text: "Player is defeated!", type: "defeat" });
    setGameOver(true);
    setAutoBattle(false);

    return { defeated: "player" };
  }

  return { defeated: null };
};