import React from "react";

const BattleLog = ({ turnLogs, logContainerRef }) => {
  return (
    <>
      <h2 className="font-semibold mt-4">Battle Log:</h2>
      <div
        ref={logContainerRef}
        className="mt-2 max-h-64 overflow-y-auto bg-game-secondary"
      >
        {turnLogs
          .slice()
          .reverse()
          .map((turnEntry, turnIndex, reversedArray) => (
            <div key={turnEntry.turnId}>
              {turnEntry.logs.map((log, logIndex) => (
                <p
                  key={`${turnEntry.turnId}-${logIndex}`}
                  className={`text-sm ${log.color}`}
                >
                  {log.message}
                </p>
              ))}
              {turnIndex < reversedArray.length - 1 &&
                turnEntry.logs.length > 0 && (
                  <hr className="my-2 border-gray-300" />
                )}
            </div>
          ))}
      </div>
    </>
  );
};

export default BattleLog;