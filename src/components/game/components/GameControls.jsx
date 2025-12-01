import React from "react";

const GameControls = ({
  isAuto,
  toggleAuto,
  handleAttack,
  handleEndRun,
  autoSpeed,
  setAutoSpeed,
  min,
  max,
  step,
  gameOver,
  showUpgradeOptions,
  showShop,
  resetGame,
}) => {
  return (
    <>
      <div
        className="flex justify-center items-center space-x-2 py-2"
        title={`Adjust Auto Speed: ${autoSpeed} ms`}
      >
        <span>Auto Speed:</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={max - autoSpeed + min}
          onChange={(e) => setAutoSpeed(max - Number(e.target.value) + min)}
        />
      </div>

      {!gameOver && (
        <div className="flex space-x-2 items-stretch">
          <button
            onClick={toggleAuto}
            className={`flex-1 text-sm sm:text-base ${isAuto ? "button-warning" : "button-success"}`}
          >
            {isAuto ? "Stop Auto" : "Auto"}
          </button>

          {!isAuto && !showUpgradeOptions && !showShop && (
            <>
              <button onClick={handleAttack} className="flex-1 text-sm sm:text-base button-info">
                Next Turn
              </button>
              <button
                onClick={handleEndRun}
                title="End Run"
                className="w-12 flex justify-center items-center text-sm sm:text-base button-danger"
              >
                ☠️
              </button>
            </>
          )}
        </div>
      )}
      {gameOver && (
        <button
          onClick={resetGame}
          className="px-4 py-2 rounded"
        >
          Restart Game
        </button>
      )}
    </>
  );
};

export default GameControls;
