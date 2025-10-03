export const addLog = (message, type, currentTurnLogs) => {
  const colorMap = {
    turn: "",
    attackCritical: "text-orange-500",
    regeneration: "text-green-400",
    lifeSteal: "text-green-400",
    gameOver: "text-red-500",
    dodge: "text-blue-500",
    stun: "text-yellow-300",
    counterattack: "text-yellow-600",
    swiftness: "text-cyan-400",
    burn: "text-orange-500",
    poison: "text-purple-500",
    thorn: "text-red-700",
    levelUp: "text-blue-500",
    upgrade: "text-yellow-500",
    purchase: "text-yellow-500",
    gold: "text-yellow-500",
    ticket: "text-pink-500",
  };
  currentTurnLogs.push({ message, color: colorMap[type] || "" });
};

export const checkGameOver = (newPlayer, newEnemy, currentTurnLogs, level) => {
  if (newEnemy.currentHealth <= 0) {
    const goldGained = Math.floor(
      newEnemy.maxHealth +
        newEnemy.minAttack +
        newEnemy.maxAttack +
        newEnemy.critChance * 100 +
        newEnemy.critDamage * 100 +
        newEnemy.lifeSteal * 100 +
        newEnemy.regeneration +
        newEnemy.dodge * 100 +
        newEnemy.armor +
        newEnemy.rareStats.burn +
        newEnemy.rareStats.poison +
        newEnemy.rareStats.thorn +
        newEnemy.rareStats.counterattack * 100 +
        newEnemy.rareStats.stunChance * 100 +
        newEnemy.rareStats.swiftness * 100
    );
    newPlayer.gold += goldGained;
    addLog(`Enemy defeated! Level up to ${level + 1}!`, "levelUp", currentTurnLogs);
    addLog(`Player gained ${goldGained} gold!`, "gold", currentTurnLogs);
    return { isOver: false, levelUp: true };
  }
  if (newPlayer.currentHealth <= 0) {
    addLog("Player defeated!", "gameOver", currentTurnLogs);
    return { isOver: true, levelUp: false };
  }
  return { isOver: false, levelUp: false };
};

export const startTurn = (turn, level, currentTurnLogs) => {
  addLog(`Turn ${turn}`, "turn", currentTurnLogs);
};