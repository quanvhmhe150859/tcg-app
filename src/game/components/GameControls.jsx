export default function GameControls({
  battleStarted,
  autoBattle,
  gameOver,
  pendingUpgrades,
  onStart,
  onToggleAuto,
  onRestart,
  shopPending,
}) {
  return (
    <div className="flex gap-2 mt-4">
      {gameOver ? (
        <button
          className="bg-red-600 hover:bg-red-700 py-1 px-4 rounded"
          onClick={onRestart}
        >
          Restart
        </button>
      ) : (
        !pendingUpgrades && !shopPending && (
          <>
            {!autoBattle && (
              <button
                className="bg-green-600 hover:bg-green-700 py-1 px-4 rounded"
                onClick={onStart}
              >
                {battleStarted ? "Next Round" : "Start"}
              </button>
            )}
            {battleStarted && (
              <button
                className={`bg-yellow-600 hover:bg-yellow-700 py-1 px-4 rounded`}
                onClick={onToggleAuto}
              >
                {autoBattle ? "Stop Auto" : "Auto"}
              </button>
            )}
          </>
        )
      )}
    </div>
  );
}
