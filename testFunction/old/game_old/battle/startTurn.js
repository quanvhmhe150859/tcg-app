// Phase 1: Start Turn
export const startTurn = (stats, turn, roundLog) => {
  roundLog.push({ text: `Turn ${turn.current}`, type: "normal" });
  let newStats = { ...stats };
  if (newStats.regen > 0) {
    newStats.health += newStats.regen;
    roundLog.push({
      text: `Player regenerates ${newStats.regen} HP.`,
      type: "heal",
    });
  }
  return newStats;
};