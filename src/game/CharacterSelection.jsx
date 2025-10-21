import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ANIMATION_SELECT_CHARACTER_CONFIGS } from "./constants/animationConstants";
import { CHARACTER_STATS } from "./constants/characterStats";
import "../components/common/styles/CardItem.css";

const CharacterSelection = () => {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [modalFrame, setModalFrame] = useState(0);
  const navigate = useNavigate();

  // 🔹 Lọc chỉ lấy nhân vật chính (loại bỏ biến thể) và sắp xếp theo thứ tự A → Z
  const baseCharacters = Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS)
    .filter((key) => !key.includes("/"))
    .sort((a, b) => a.localeCompare(b));

  // 🔹 Lấy danh sách biến thể (bao gồm default)
  const getVariants = (baseKey) => [
    baseKey,
    ...Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS).filter((k) =>
      k.startsWith(baseKey + "/")
    ),
  ];

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

  // 🔹 Định dạng giá trị chỉ số (hiển thị % cho dodge, critChance, critDamage, màu xanh lá cho > 0, màu đỏ cho < 0)
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
      return { text: `+ ${formattedValue}`, className: "text-green-500" };
    } else if (value < 0) {
      return { text: `- ${formattedValue}`, className: "text-red-500" };
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

        {/* Danh sách nhân vật bình thường */}
        {baseCharacters.map((characterKey) => (
          <div
            key={characterKey}
            className="relative w-32 h-42 bg-game-secondary rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 cursor-pointer"
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
                {characterKey}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Modal hiển thị biến thể */}
      {selectedCharacter && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="rounded-lg p-6 w-96 relative bg-game"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-white text-2xl"
              onClick={() => setSelectedCharacter(null)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 capitalize text-center">
              {selectedCharacter} Variants
            </h2>

            <div className="flex flex-wrap gap-4 justify-center">
              {getVariants(selectedCharacter).map((variantKey) => {
                const stats =
                  CHARACTER_STATS[variantKey.split("/")[0]][
                    variantKey.includes("/")
                      ? variantKey.split("/")[1]
                      : "default"
                  ];
                return (
                  <div
                    key={variantKey}
                    className="w-36 pb-4 rounded-md overflow-hidden text-center text-white cursor-pointer transition bg-game-secondary"
                    onClick={() => handleSelectVariant(variantKey)}
                  >
                    <div
                      className="relative w-full h-32 overflow-visible"
                      style={{
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "auto",
                        backgroundImage: `url(${getSpriteUrl(
                          variantKey,
                          modalFrame
                        )})`,
                      }}
                    ></div>
                    <span className="block text-sm font-bold capitalize">
                      {variantKey === selectedCharacter
                        ? "Default"
                        : formatVariantName(variantKey)}
                    </span>
                    {/* Hiển thị chỉ số bonus động dựa trên characterStats.js */}
                    <div className="text-xs mt-1 flex flex-col items-center justify-center">
                      {Object.entries(stats).flatMap(([statKey, statValue]) =>
                        statKey === "rareStats"
                          ? Object.entries(statValue).map(
                              ([subKey, subValue]) => {
                                const { text, className } = formatStatValue(
                                  subKey,
                                  subValue
                                );
                                return (
                                  <p className={className} key={subKey}>
                                    {formatStatName(subKey)}: {text}
                                  </p>
                                );
                              }
                            )
                          : statKey !== "special"
                          ? [
                              <p
                                className={
                                  formatStatValue(statKey, statValue).className
                                }
                                key={statKey}
                              >
                                {formatStatName(statKey)}:{" "}
                                {formatStatValue(statKey, statValue).text}
                              </p>,
                            ]
                          : []
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;
