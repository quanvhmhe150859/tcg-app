import React, { useState, useEffect } from "react";

const BattleLog = ({ turnLogs, logContainerRef }) => {
  const [isOpen, setIsOpen] = useState(true); // Mở mặc định (bạn có thể đổi thành false)

  // Tự động scroll xuống cuối khi có log mới
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [turnLogs]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div className="">
      {/* Nút Toggle giống Equipment */}
      <button
        onClick={toggleOpen}
        className="toggle-game-stats justify-center w-full flex items-center justify-between font-semibold"
      >
        <span>{isOpen ? "➖" : "➕"} Battle Log</span>
      </button>

      {/* Nội dung log có thể thu gọn */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-game-secondary">
          <div
            ref={logContainerRef}
            className="max-h-64 min-h-64 overflow-y-auto p-2 space-y-3"
          >
            {turnLogs.length > 0 && (
              turnLogs
                .slice()
                .reverse()
                .map((turnEntry, turnIndex, reversedArray) => (
                  <div key={turnEntry.turnId}>
                    {turnEntry.logs.map((log, logIndex) => (
                      <p
                        key={`${turnEntry.turnId}-${logIndex}`}
                        className={`text-sm animate-in slide-in-from-top fade-in ${log.color}`}
                      >
                        {log.message}
                      </p>
                    ))}
                    {turnIndex < reversedArray.length - 1 &&
                      turnEntry.logs.length > 0 && (
                        <hr className="my-2 border-gray-300" />
                      )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleLog;
