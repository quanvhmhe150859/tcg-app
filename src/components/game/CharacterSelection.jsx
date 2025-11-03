import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ANIMATION_SELECT_CHARACTER_CONFIGS } from "./constants/animationConstants";
import { CHARACTER_STATS } from "./constants/characterStats";
import { SPECIALS } from "./constants/specials";
import { getSpecialIconPath } from "./constants/specialConfig";
import "../styles/CardItem.css";

const CharacterSelection = () => {
  useEffect(() => {
    document.body.style.minWidth = "425px";

    return () => {
      document.body.style.minWidth = ""; // reset khi rời trang
    };
  }, []);

  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [modalFrame, setModalFrame] = useState(0);
  const navigate = useNavigate();

  // Lọc chỉ lấy nhân vật default (có dạng "character/default")
  const defaultCharacters = Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS)
    .filter((key) => key.endsWith("/default"))
    .sort((a, b) => a.localeCompare(b));

  // Lấy danh sách biến thể (bao gồm default) cho nhân vật
  const getVariants = (baseKey) => {
    const baseName = baseKey.split("/")[0];
    return Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS).filter(
      (k) => k === baseName + "/default" || k.startsWith(baseName + "/")
    );
  };

  // 🔹 Lấy sprite frame
  const getSpriteUrl = (characterKey, frameIndex) => {
    const config = ANIMATION_SELECT_CHARACTER_CONFIGS[characterKey];
    const playerLayer = config.layers.find((layer) => layer.name === "front");
    const folderPath = playerLayer.folder.replace(/^\/sprites\//, "/sprites/");
    const paddedFrameIndex = frameIndex.toString().padStart(3, "0");
    return `${folderPath}frame${paddedFrameIndex}.png`;
  };

  // 🔹 Định dạng tên biến thể đẹp
  const formatVariantName = (key) => {
    const parts = key.split("/");
    const namePart = parts[1] || "default";
    return namePart
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // 🔹 Định dạng tên chỉ số đẹp (e.g., maxAttack -> Max Attack)
  const formatStatName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // Thêm khoảng trắng trước chữ in hoa
      .replace(/^./, (str) => str.toUpperCase()) // Viết hoa chữ đầu
      .trim(); // Xóa khoảng trắng thừa
  };

  // 🔹 Định dạng giá trị chỉ số (hiển thị màu xanh lá cho > 0, màu đỏ cho < 0)
  const formatStatValue = (statKey, value) => {
    const isPercentage = [
      "critChance",
      "critDamage",
      "lifeSteal",
      "dodge",
      "counterattack",
      "stunChance",
      "swiftness",
    ].includes(statKey);
    const formattedValue = isPercentage
      ? `${(value * 100).toFixed(0)}%`
      : `${Math.abs(value)}`;
    if (value > 0) {
      return { text: `+${formattedValue}`, className: "text-green-500" };
    } else if (value < 0) {
      return { text: `-${formattedValue}`, className: "text-red-500" };
    } else {
      return { text: formattedValue, className: "text-white" };
    }
  };

  // 🔹 Animation khi hover ở màn hình chọn chính
  useEffect(() => {
    if (hoveredCharacter) {
      const config = ANIMATION_SELECT_CHARACTER_CONFIGS[hoveredCharacter];
      const playerLayer = config.layers.find((layer) => layer.name === "front");
      const { frameCount, speed } = playerLayer;

      const interval = setInterval(() => {
        setCurrentFrame((prevFrame) => (prevFrame + 1) % frameCount);
      }, speed);

      return () => clearInterval(interval);
    } else {
      setCurrentFrame(0);
    }
  }, [hoveredCharacter]);

  // 🔹 Animation loop cho tất cả nhân vật trong modal
  useEffect(() => {
    if (!selectedCharacter) return;
    const baseConfig = ANIMATION_SELECT_CHARACTER_CONFIGS[selectedCharacter];
    const baseLayer = baseConfig.layers.find((l) => l.name === "front");
    const { frameCount, speed } = baseLayer;

    const interval = setInterval(() => {
      setModalFrame((prev) => (prev + 1) % frameCount);
    }, speed);

    return () => clearInterval(interval);
  }, [selectedCharacter]);

  // 🔹 Chuyển hướng sang BattleGame với nhân vật đã chọn
  const handleSelectVariant = (variantKey) => {
    navigate("/game", { state: { playerCharacter: variantKey } });
  };

  // 🔹 Chọn ngẫu nhiên (random)
  const handleSelectRandom = () => {
    // Lấy tất cả các key nhân vật (bao gồm cả biến thể)
    const allCharacters = Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS);
    // Chọn ngẫu nhiên một nhân vật hoặc biến thể
    const randomCharacter =
      allCharacters[Math.floor(Math.random() * allCharacters.length)];
    navigate("/game", { state: { playerCharacter: randomCharacter } });
  };

  return (
    <div className="inline-flex flex-col items-center p-8 rounded-lg bg-game">
      <h1 className="text-4xl font-bold mb-8">Select Your Character</h1>

      {/* 🔹 Grid danh sách nhân vật chính (thêm ô Random đầu tiên) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Ô chọn ngẫu nhiên */}
        <div
          key="random"
          className="relative w-32 h-42 bg-game-secondary rounded-lg overflow-hidden shadow-lg 
          transform transition duration-300 hover:scale-105 cursor-pointer"
          onClick={handleSelectRandom}
        >
          <img
            src="/question_mark.gif"
            alt="Random Character"
            className="w-32 h-32 object-contain"
          />
          <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-center py-2">
            <span className="text-white text-lg font-semibold capitalize">
              Random
            </span>
          </div>
        </div>

        {/* Danh sách nhân vật default */}
        {defaultCharacters.map((characterKey) => {
          const baseName = characterKey.split("/")[0];
          return (
            <div
              key={characterKey}
              className="relative w-32 h-42 bg-game-secondary rounded-lg overflow-hidden shadow-lg transform transition 
              duration-300 hover:scale-105 cursor-pointer"
              onMouseEnter={() => setHoveredCharacter(characterKey)}
              onMouseLeave={() => setHoveredCharacter(null)}
              onClick={() => setSelectedCharacter(characterKey)}
            >
              <div
                className="relative w-32 h-32 overflow-visible"
                style={{
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                  backgroundSize: "auto",
                  backgroundImage: `url(${getSpriteUrl(
                    characterKey,
                    hoveredCharacter === characterKey ? currentFrame : 0
                  )})`,
                }}
              />
              <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-center py-2">
                <span className="text-white text-lg font-semibold capitalize">
                  {baseName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== MODAL ==================== */}
      {selectedCharacter && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-2000"
          onClick={() => setSelectedCharacter(null)}
        >
          {/* Thêm overflow-y-auto và giới hạn chiều cao */}
          <div
            className="bg-game rounded-lg p-6 w-full max-w-6xl relative flex flex-col max-h-full"
            style={{ maxHeight: "calc(100vh - 2rem)" }} // trừ padding 2rem (p-4)
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng - luôn hiển thị, cố định góc */}
            <button
              className="absolute top-3 right-3 text-3xl text-white hover:text-red-400 z-10 bg-black/50 rounded-full w-10 h-10 
              flex items-center justify-center"
              onClick={() => setSelectedCharacter(null)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center capitalize pr-10">
              {selectedCharacter.split("/")[0]} Variants
            </h2>

            {/* Nội dung cuộn được */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 p-4">
                {getVariants(selectedCharacter).map((variantKey) => {
                  const baseName = variantKey.split("/")[0];
                  const variantName = variantKey.includes("/")
                    ? variantKey.split("/")[1]
                    : "default";

                  const stats = CHARACTER_STATS[baseName][variantName];
                  const special = stats.specials?.[0]
                    ? SPECIALS.find((s) => s.id === stats.specials[0].specialId)
                    : null;

                  return (
                    <div
                      key={variantKey}
                      className="bg-game-secondary rounded-lg overflow-hidden text-white
                         cursor-pointer transition-all duration-200
                         hover:ring-4 hover:ring-yellow-400 hover:scale-105
                         shadow-lg flex flex-col h-96"
                      onClick={() => handleSelectVariant(variantKey)}
                    >
                      {/* ---------- SPRITE (cố định 160px) ---------- */}
                      <div
                        className="relative w-full h-40 bg-gradient-to-b from-transparent to-black/50
                                flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={getSpriteUrl(variantKey, modalFrame)}
                          alt={variantKey}
                          className="max-w-full max-h-full object-contain pointer-events-none select-none"
                          style={{ imageRendering: "pixelated" }}
                          loading="eager"
                        />
                      </div>

                      {/* ---------- NỘI DUNG DƯỚI ---------- */}
                      <div className="flex-1 flex flex-col px-3 pt-2">
                        <h3 className="text-sm font-bold text-center h-10 flex items-center justify-center">
                          {variantKey === selectedCharacter
                            ? "Default"
                            : formatVariantName(variantKey)}
                        </h3>

                        <div className="text-xs space-y-0.5 flex-1 overflow-y-auto max-h-28 px-1">
                          {Object.entries(stats).flatMap(
                            ([statKey, statValue]) =>
                              statKey === "rareStats"
                                ? Object.entries(statValue).map(
                                    ([subKey, subValue]) => {
                                      const { text, className } =
                                        formatStatValue(subKey, subValue);
                                      return (
                                        <p
                                          key={subKey}
                                          className={`font-medium ${className}`}
                                        >
                                          {formatStatName(subKey)}: {text}
                                        </p>
                                      );
                                    }
                                  )
                                : statKey !== "specials"
                                ? (() => {
                                    const { text, className } = formatStatValue(
                                      statKey,
                                      statValue
                                    );
                                    return (
                                      <p
                                        key={statKey}
                                        className={`font-medium ${className}`}
                                      >
                                        {formatStatName(statKey)}: {text}
                                      </p>
                                    );
                                  })()
                                : []
                          )}
                        </div>

                        {special && (
                          <div className="mt-2 border-t border-gray-600 pt-2 flex flex-col items-center">
                            <img
                              src={getSpecialIconPath(special.image)}
                              alt={special.name}
                              className="w-10 h-10 object-contain mb-1 special-icon"
                              onError={(e) => {
                                e.target.style.display = "none";
                                // e.target.nextSibling.textContent = "Skill";
                              }}
                            />
                            <p className="text-xs font-semibold text-cyan-300 truncate w-full text-center drop-shadow-[0_0_1px_black]">
                              {special.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;