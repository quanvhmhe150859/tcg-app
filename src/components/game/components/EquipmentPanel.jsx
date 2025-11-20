import React from "react";

const EquipmentPanel = ({ player, onEquipClick }) => {
  const getEquipIcon = (slot) => {
    const item = player.equipment?.[slot];
    return item?.icon || null; // nếu không có → trả về null
  };

  const getTooltip = (slot) => {
    const item = player.equipment?.[slot];
    if (!item) return "Empty slot";

    const stats = item.stats
      ? Object.entries(item.stats)
          .map(([key, value]) => `${key}: +${value}`)
          .join(" • ")
      : "";
    return `${item.name}${stats ? `\n${stats}` : ""}`.trim();
  };

  return (
    <>
      <p className="font-semibold mt-6 mb-2 border-t border-gray-500 pt-3">
        Equipment
      </p>

      {/* Layout responsive - dùng Tailwind, không dùng window.innerWidth */}
      <div className="bg-black bg-opacity-40 rounded-lg p-4 border border-gray-600">
        {/* =============== MÀN HÌNH >= 1024px (LG) =============== */}
        <div className="hidden lg:flex items-center justify-center gap-6">
          {/* Cột trái: Vũ khí */}
          <div className="flex flex-col justify-center gap-4">
            <EquipSlot
              slot="weapon1"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="weapon2"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
          </div>

          {/* Cột giữa */}
          <div className="flex flex-col items-center gap-4">
            <EquipSlot
              slot="helmet"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="armor"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />

            <div className="flex items-center gap-4">
              <EquipSlot
                slot="gloves"
                {...{ getEquipIcon, getTooltip, onEquipClick }}
              />
              <EquipSlot
                slot="belt"
                {...{ getEquipIcon, getTooltip, onEquipClick }}
              />
              <EquipSlot
                slot="boots"
                {...{ getEquipIcon, getTooltip, onEquipClick }}
              />
            </div>
          </div>

          {/* Cột phải */}
          <div className="flex flex-col justify-center gap-4">
            <EquipSlot
              slot="necklace"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="ring1"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="ring2"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
          </div>
        </div>

        {/* =============== MÀN HÌNH < 1024px =============== */}
        <div className="grid lg:hidden grid-cols-2 gap-x-8 gap-y-6 max-w-md mx-auto">
          {/* Cột 1 */}
          <div className="flex flex-col items-center gap-4">
            <EquipSlot
              slot="helmet"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="armor"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="gloves"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="belt"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="boots"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />

            <div className="border-t border-gray-600 w-20 my-3" />

            <EquipSlot
              slot="weapon1"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="weapon2"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
          </div>

          {/* Cột 2 */}
          <div className="flex flex-col items-center gap-4">
            <EquipSlot
              slot="necklace"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="ring1"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
            <EquipSlot
              slot="ring2"
              {...{ getEquipIcon, getTooltip, onEquipClick }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Component con: 1 ô trang bị (giữ nguyên đẹp)
const EquipSlot = ({ slot, getEquipIcon, getTooltip, onEquipClick }) => {
  const icon = getEquipIcon(slot);
  const tooltip = getTooltip(slot);
  const hasItem = !!icon; // true chỉ khi thực sự có icon

  return (
    <button
      onClick={() => onEquipClick?.(slot)}
      className={`
        relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg border-2 overflow-hidden
        transition-all duration-200 flex items-center justify-center
        ${
          hasItem
            ? "border-purple-400 hover:scale-110 hover:border-purple-300 shadow-lg shadow-purple-500/40"
            : "border-gray-700 bg-black bg-opacity-30 hover:border-gray-600"
        }
        ${!onEquipClick ? "cursor-default" : "cursor-pointer"}
      `}
      title={hasItem ? tooltip.replace(/\n/g, " • ") : "Empty slot"}
    >
      {hasItem ? (
        <img src={icon} alt={slot} className="w-full h-full object-cover" />
      ) : (
        // Có thể thêm icon "+" nhỏ hoặc để trống hoàn toàn
        <span className="text-gray-600 text-3xl font-bold select-none">+</span>
      )}

      {hasItem && (
        <div className="absolute inset-0 border-2 border-purple-400 rounded-lg pointer-events-none animate-pulse"></div>
      )}
    </button>
  );
};

export default EquipmentPanel;
