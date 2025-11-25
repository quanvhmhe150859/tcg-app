import React from "react";

const ToggleButtons = ({ showNormalStats, showRareStats, toggleNormalStats, toggleRareStats }) => {
  return (
    <div className="flex justify-center space-x-2 relative z-30 py-2 px-4">
      <button
        onClick={toggleNormalStats}
        className="toggle-game-stats text-sm sm:text-base"
      >
        {showNormalStats ? "➖ Primary" : "➕ Primary"}
      </button>
      <button
        onClick={toggleRareStats}
        className="toggle-game-stats text-sm sm:text-base"
      >
        {showRareStats ? "➖ Secondary" : "➕ Secondary"}
      </button>
    </div>
  );
};

export default ToggleButtons;