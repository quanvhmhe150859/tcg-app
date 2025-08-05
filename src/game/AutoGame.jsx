import { useGameEngine } from "./hooks/useGameEngine";
import BattleLog from "./components/BattleLog";
import UpgradeOptions from "./components/UpgradeOptions";
import PlayerStats from "./components/PlayerStats";
import EnemyStats from "./components/EnemyStats";
import GameControls from "./components/GameControls";
import ShopOptions from "./components/ShopOptions";

export default function TextStatGame() {
  const {
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
    shopPending,
    shopSelection,
    handleBuy,
    boughtItems,
    handleExitShop,
    handleReroll,
    rerollCost,
  } = useGameEngine();

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 max-w-4xl mx-auto bg-gray-900 rounded">
      <div className="flex-1 flex flex-col gap-4">
        <PlayerStats stats={stats} />

        <hr className="border-gray-600" />

        {enemy && <EnemyStats level={level} enemy={enemy} />}

        <GameControls
          battleStarted={battleStarted}
          autoBattle={autoBattle}
          gameOver={gameOver}
          pendingUpgrades={pendingUpgrades}
          onStart={startBattle}
          onToggleAuto={() => setAutoBattle((prev) => !prev)}
          onRestart={restartGame}
          shopPending={shopPending}
        />
      </div>

      <div className="w-full sm:w-1/2 flex flex-col gap-4">
        <BattleLog logs={logs} />
        {pendingUpgrades && (
          <UpgradeOptions upgrades={pendingUpgrades} onSelect={applyUpgrade} />
        )}
        {shopPending && (
          <ShopOptions
            items={shopSelection}
            gold={stats.gold}
            onSelect={handleBuy}
            onExit={handleExitShop}
            boughtItems={boughtItems}
            handleReroll={handleReroll}
            rerollCost={rerollCost}
          />
        )}
      </div>
    </div>
  );
}
