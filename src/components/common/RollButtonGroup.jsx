import React from "react";
import { Tooltip } from "react-tooltip";

const RollButtonGroup = ({ handleRoll, isRolling, options = [1, 10] }) => {
  return (
    <div className="flex w-full md:w-fit md:mx-auto gap-2 md:justify-center p-4">
      {options.map((count, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => handleRoll(count)}
            disabled={isRolling}
            className={`min-w-0 flex-1 flex flex-col items-center justify-center p-4 bg-blue-${
              500 + index * 100
            } text-white rounded disabled:opacity-50`}
            data-tooltip-id={`tooltip-roll-${count}`}
            data-tooltip-content={`Roll ${count} card${count > 1 ? "s" : ""}`}
          >
            <span className="text-2xl">🎲</span>
            <span className="whitespace-nowrap text-sm">Roll {count}</span>
          </button>
          <Tooltip
            id={`tooltip-roll-${count}`}
            place="bottom"
            multiline
            className="max-w-[200px] break-words text-sm"
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default RollButtonGroup;
