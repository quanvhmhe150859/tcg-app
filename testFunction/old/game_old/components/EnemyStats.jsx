export default function EnemyStats({ level, enemy }) {
  return (
    <div className="flex flex-col gap-2 text-white">
      {enemy.isBoss && <span className="text-red-500 font-bold ml-2">BOSS</span>}
      <h2 className="text-lg font-bold">Level {level}</h2>
      <div className="flex justify-between"><span>{enemy.name}</span></div>
      <div className="flex justify-between"><span>Health:</span><span>{enemy.health}</span></div>
      <div className="flex justify-between"><span>Attack:</span><span>{enemy.minAttack} - {enemy.maxAttack}</span></div>
      <div className="flex justify-between"><span>Armor:</span><span>{enemy.armor}</span></div>
    </div>
  );
}
