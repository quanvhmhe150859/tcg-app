export default function PlayerGoldLuckBar({ player, showNormalStats }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm p-1">
      {/* Luck - chỉ hiện nếu bật stats */}
      {showNormalStats && (
        <div className="text-green-500 font-medium">
          Luck: {player.luck} 🍀
        </div>
      )}

      {/* Gold - luôn xuất hiện, tự động căn giữa khi không có Luck */}
      <div
        className={`${
          showNormalStats ? "text-right" : "mx-auto text-center"
        } flex-1 text-yellow-400 font-medium`}
      >
        Gold: {player.gold} 💰
      </div>
    </div>
  );
}
