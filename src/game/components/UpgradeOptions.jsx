export default function UpgradeOptions({ upgrades, onSelect }) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold">Upgrade:</h3>
      {upgrades.map((upg, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(upg)}
          className="block w-full rounded px-3 py-1"
        >
          {upg.label}
        </button>
      ))}
    </div>
  );
}
