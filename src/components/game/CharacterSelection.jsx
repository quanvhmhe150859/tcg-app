import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ANIMATION_SELECT_CHARACTER_CONFIGS } from "./constants/animationConstants";
import { CHARACTER_STATS } from "./constants/characterStats";
import { SPECIALS } from "./constants/specials";
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

  const [maxCardHeight, setMaxCardHeight] = useState(0);
  const cardRefs = useRef([]);

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

  useEffect(() => {
    if (!selectedCharacter || cardRefs.current.length === 0) return;

    // Reset
    cardRefs.current = cardRefs.current.slice(
      0,
      getVariants(selectedCharacter).length
    );

    // Đợi DOM render xong
    const timer = setTimeout(() => {
      const heights = cardRefs.current
        .filter((ref) => ref)
        .map((ref) => {
          const content = ref.querySelector(".card-content");
          return content ? content.offsetHeight : 0;
        });

      const max = Math.max(...heights, 0);
      setMaxCardHeight(max);
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedCharacter, modalFrame]);

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
                  {baseName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔹 Modal hiển thị biến thể */}
      {selectedCharacter && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedCharacter(null);
            setMaxCardHeight(0);
            cardRefs.current = [];
          }}
        >
          <div
            className="rounded-lg p-6 w-full relative bg-game mr-4 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-white text-2xl"
              onClick={() => {
                setSelectedCharacter(null);
                setMaxCardHeight(0);
                cardRefs.current = [];
              }}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 capitalize text-center">
              {selectedCharacter.split("/")[0]} Variants
            </h2>

            <div className="flex flex-wrap gap-4 justify-center">
              {getVariants(selectedCharacter).map((variantKey, index) => {
                const baseName = variantKey.split("/")[0];
                const variantName = variantKey.includes("/")
                  ? variantKey.split("/")[1]
                  : "default";
                const stats = CHARACTER_STATS[baseName][variantName];
                const specialId = stats.specialId;
                const special = SPECIALS.find((s) => s.id === specialId);

                return (
                  <div
                    key={variantKey}
                    ref={(el) => {
                      if (el) cardRefs.current[index] = el;
                    }}
                    className="w-36 rounded-md overflow-hidden text-center text-white cursor-pointer transition bg-game-secondary hover:bg-game-secondary/80 flex flex-col"
                    style={{
                      minHeight: maxCardHeight
                        ? `${maxCardHeight + 100}px`
                        : "auto",
                    }} // +100 cho ảnh special
                    onClick={() => handleSelectVariant(variantKey)}
                  >
                    {/* Sprite */}
                    <div
                      className="relative w-full h-32 overflow-visible bg-cover"
                      style={{
                        backgroundImage: `url(${getSpriteUrl(
                          variantKey,
                          modalFrame
                        )})`,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />

                    {/* Tên biến thể */}
                    <span className="block text-sm font-bold capitalize px-2 mt-2">
                      {variantKey === selectedCharacter
                        ? "Default"
                        : formatVariantName(variantKey)}
                    </span>

                    {/* Nội dung stats – đo chiều cao */}
                    <div className="card-content flex-1 px-2 mt-1 mb-1 text-xs flex flex-col justify-start">
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
                          : statKey !== "specialId" && statKey !== "special"
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

                    {/* Special Ability – luôn ở đáy */}
                    {/* {special && (
                      <div className="mt-auto p-2 border-t border-white/20">
                        <img
                          src={`/specials/${special.image}`}
                          alt={special.name}
                          className="w-6 h-6 mx-auto object-contain rounded-full border border-yellow-500 shadow-md"
                          title={special.name}
                        />
                        <p className="text-xs mt-1 text-yellow-400 font-semibold truncate px-1">
                          {special.name}
                        </p>
                      </div>
                    )} */}
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
