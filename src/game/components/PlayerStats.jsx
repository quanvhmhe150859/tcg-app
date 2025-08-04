export default function PlayerStats({ stats }) {
  return (
    <div className="flex flex-col gap-2 text-white">
      <h2 className="text-lg font-bold">Player Stats</h2>
      <div className="flex justify-between">
        <span>Health:</span>
        <span>{stats.health}</span>
      </div>
      <div className="flex justify-between">
        <span>Regen:</span>
        <span>{stats.regen}</span>
      </div>
      <div className="flex justify-between">
        <span>Attack:</span>
        <span>
          {stats.minAttack} - {stats.maxAttack}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Armor:</span>
        <span>{stats.armor}</span>
      </div>
      <div className="flex justify-between">
        <span>Dodge:</span>
        <span>
          {stats.dodge}%{stats.dodge >= 60 ? " / 60%" : ""}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Crit Chance:</span>
        <span>{stats.critChance}%</span>
      </div>
      <div className="flex justify-between">
        <span>Life Steal:</span>
        <span>{stats.lifeSteal}%</span>
      </div>
      <div className="flex justify-between text-yellow-300">
        <span>Gold:</span>
        <span>{stats.gold}</span>
      </div>
      {Object.entries(stats.effects).some(([_, v]) => v > 0) && (
        <div>
          Effects:{" "}
          {Object.entries(stats.effects)
            .filter(([_, v]) => v > 0)
            .map(([k, v]) => `${k} (${v})`)
            .join(", ")}
        </div>
      )}
    </div>
  );
}
