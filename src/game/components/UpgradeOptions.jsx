export default function UpgradeOptions({ upgrades, onSelect }) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold">Choose an Upgrade:</h3>
      {upgrades.map((upg, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(upg)}
          className="block w-full bg-blue-600 hover:bg-blue-700 rounded px-3 py-1"
        >
          {upg.label}
        </button>
      ))}
    </div>
  );
}
