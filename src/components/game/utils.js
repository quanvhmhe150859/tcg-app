export const addLog = (message, type, currentTurnLogs) => {
  const colorMap = {
    turn: "",
    attackCritical: "text-orange-500",
    regeneration: "text-green-400",
    lifeSteal: "text-green-400",
    gameOver: "text-red-500",
    dodge: "text-blue-500",
    shield: "text-blue-500",
    barrier: "text-blue-500",
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
    special: "text-red-600",
  };
  currentTurnLogs.push({ message, color: colorMap[type] || "" });
};