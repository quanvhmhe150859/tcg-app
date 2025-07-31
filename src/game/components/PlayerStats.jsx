export default function PlayerStats({ stats }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold">Player Stats</h2>
      <div className="flex justify-between"><span>Health:</span><span>{stats.health}</span></div>
      <div className="flex justify-between"><span>Armor:</span><span>{stats.armor}</span></div>
      <div className="flex justify-between"><span>Dodge:</span><span>{stats.dodge}%</span></div>
      <div className="flex justify-between"><span>Attack:</span><span>{stats.minAttack} - {stats.maxAttack}</span></div>
      <div className="flex justify-between"><span>Regen:</span><span>{stats.regen}</span></div>
      <div className="flex justify-between"><span>Life Steal:</span><span>{stats.lifeSteal}%</span></div>
      <div className="flex justify-between"><span>Crit Chance:</span><span>{stats.critChance}%</span></div>
    </div>
  );
}
