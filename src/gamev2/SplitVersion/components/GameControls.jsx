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
  resetGame
}) => {
  return (
    <>
      <div
        className="flex justify-center items-center space-x-2 mb-2"
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

      {!gameOver && !showUpgradeOptions && !showShop && (
        <div className="space-x-2">
          <button
            onClick={toggleAuto}
            className={`${isAuto ? "w-[100%]" : "w-[40%]"}`}
          >
            {isAuto ? "Stop Auto" : "Auto"}
          </button>

          {!isAuto && (
            <>
              <button onClick={handleAttack} className="w-[40%]">
                Next Turn
              </button>
              <button onClick={handleEndRun} title="End Run">
                ☠️
              </button>
            </>
          )}
        </div>
      )}
      {gameOver && (
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          Restart Game
        </button>
      )}
    </>
  );
};

export default GameControls;
