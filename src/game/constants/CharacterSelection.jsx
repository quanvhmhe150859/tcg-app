import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ANIMATION_CONFIGS } from "./animationConstants";

const CharacterSelection = () => {
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [modalFrame, setModalFrame] = useState(0);
  const navigate = useNavigate();

  // 🔹 Lọc chỉ lấy nhân vật chính (loại bỏ biến thể) và sắp xếp theo thứ tự A → Z
  const baseCharacters = Object.keys(ANIMATION_CONFIGS)
    .filter((key) => !key.includes("/"))
    .sort((a, b) => a.localeCompare(b));

  // 🔹 Lấy danh sách biến thể (bao gồm default)
  const getVariants = (baseKey) => [
    baseKey,
    ...Object.keys(ANIMATION_CONFIGS).filter((k) =>
      k.startsWith(baseKey + "/")
    ),
  ];

  // 🔹 Lấy sprite frame
  const getSpriteUrl = (characterKey, frameIndex) => {
    const config = ANIMATION_CONFIGS[characterKey];
    const playerLayer = config.layers.find((layer) => layer.name === "player");
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

  // 🔹 Animation khi hover ở màn hình chọn chính
  useEffect(() => {
    if (hoveredCharacter) {
      const config = ANIMATION_CONFIGS[hoveredCharacter];
      const playerLayer = config.layers.find(
        (layer) => layer.name === "player"
      );
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
    const baseConfig = ANIMATION_CONFIGS[selectedCharacter];
    const baseLayer = baseConfig.layers.find((l) => l.name === "player");
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
    navigate("/game", { state: { playerCharacter: "random" } });
  };

  return (
    <div className="inline-flex flex-col items-center p-8 rounded-lg bg-game">
      <h1 className="text-4xl font-bold mb-8">
        Select Your Character
      </h1>

      {/* 🔹 Grid danh sách nhân vật chính (thêm ô Random đầu tiên) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Ô chọn ngẫu nhiên */}
        <div
          key="random"
          className="relative w-32 h-48 bg-game-secondary rounded-lg overflow-hidden shadow-lg 
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
            className="relative w-32 h-48 bg-game-secondary rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 cursor-pointer"
            onMouseEnter={() => setHoveredCharacter(characterKey)}
            onMouseLeave={() => setHoveredCharacter(null)}
            onClick={() => setSelectedCharacter(characterKey)}
          >
            <div
              className="w-32 h-32 bg-contain bg-center bg-no-repeat"
              style={{
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
        <div className="modal-overlay" onClick={() => setSelectedCharacter(null)}>
          <div className="rounded-lg p-6 w-96 relative bg-game" onClick={(e) => e.stopPropagation()}>
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
              {getVariants(selectedCharacter).map((variantKey) => (
                <div
                  key={variantKey}
                  className="w-24 h-32 rounded-md overflow-hidden text-center text-white 
                  cursor-pointer transition bg-game-secondary"
                  onClick={() => handleSelectVariant(variantKey)}
                >
                  <div
                    className="w-full h-24 bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${getSpriteUrl(
                        variantKey,
                        modalFrame
                      )})`,
                    }}
                  ></div>
                  <span className="block text-sm capitalize">
                    {variantKey === selectedCharacter
                      ? "Default"
                      : formatVariantName(variantKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;
