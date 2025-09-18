export const addLog = (message, type, currentTurnLogs) => {
  const colorMap = {
    turn: "",
    attackCritical: "text-orange-500",
    lifeSteal: "text-green-500",
    regeneration: "text-green-500",
    gameOver: "text-red-500",
    dodge: "text-blue-500",
    stun: "text-blue-500",
    burn: "text-orange-500",
    poison: "text-purple-500",
    levelUp: "text-purple-500",
    upgrade: "text-yellow-500",
    purchase: "text-yellow-500",
    gold: "text-yellow-500",
  };
  currentTurnLogs.push({ message, color: colorMap[type] || "" });
};

export const checkGameOver = (newPlayer, newEnemy, currentTurnLogs, level) => {
  if (newEnemy.health <= 0) {
    const goldGained = Math.floor(
      newEnemy.health +
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
        newEnemy.rareStats.stunChance * 100
    );
    newPlayer.gold += goldGained;
    addLog(`Enemy defeated! Level up to ${level + 1}!`, "levelUp", currentTurnLogs);
    addLog(`Player gained ${goldGained} gold!`, "gold", currentTurnLogs);
    return { isOver: false, levelUp: true };
  }
  if (newPlayer.health <= 0) {
    addLog("Player defeated!", "gameOver", currentTurnLogs);
    return { isOver: true, levelUp: false };
  }
  return { isOver: false, levelUp: false };
};

export const startTurn = (turn, level, currentTurnLogs) => {
  addLog(`Turn ${turn} (Level ${level})`, "turn", currentTurnLogs);
};