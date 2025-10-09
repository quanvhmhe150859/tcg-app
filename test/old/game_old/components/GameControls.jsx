export default function GameControls({
  battleStarted,
  autoBattle,
  gameOver,
  pendingUpgrades,
  onStart,
  onToggleAuto,
  onRestart,
  shopPending,
  onEndRun,
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
        !pendingUpgrades &&
        !shopPending && (
          <>
            {battleStarted && (
              <button onClick={onToggleAuto}>
                {autoBattle ? "Stop Auto" : "Auto"}
              </button>
            )}
            {!autoBattle && (
              <>
                <button onClick={onStart}>
                  {battleStarted ? "Next Round" : "Start"}
                </button>
                {battleStarted && (
                  <button className="" onClick={onEndRun}>
                    ☠️
                  </button>
                )}
              </>
            )}
          </>
        )
      )}
    </div>
  );
}
