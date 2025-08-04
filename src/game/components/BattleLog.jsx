import { getLogColor } from "../utils/logUtils";

export default function BattleLog({ logs }) {
  return (
    <div className="max-h-96 overflow-y-auto bg-gray-800 p-2 rounded text-sm text-white">
      <h3 className="font-bold mb-1">Battle Log</h3>
      <ul className="space-y-2">
        {logs.map((turn, i) => (
          <li key={i} className="border-b border-gray-700 pb-1">
            {turn.map((log, j) => (
              <div
                key={j}
                className={getLogColor(log.type)}
              >
                • {log.text}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
