import { useState } from "react";

export function useBattleLogs(max = 20) {
  const [logs, setLogs] = useState([]);

  const addLog = (roundLog) => {
    setLogs(prev => {
      const newLogs = [[...roundLog], ...prev];
      return newLogs.slice(0, max);
    });
  };

  const clearLogs = () => setLogs([]);

  return { logs, addLog, clearLogs };
}
