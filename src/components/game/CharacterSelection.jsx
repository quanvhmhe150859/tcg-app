import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ANIMATION_SELECT_CHARACTER_CONFIGS } from "./configs/spriteConfig";
import { CHARACTER_STATS } from "./constants/characters";
import { SPECIALS } from "./constants/specials";
import { getSpecialIconPath } from "./configs/specialConfig";
import "../styles/CardItem.css";

// === HELPER FUNCTIONS ===
const formatVariantName = (key) => {
  const namePart = key.split("/")[1] || "default";
  return namePart.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatStatName = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

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

  const formatted = isPercentage
    ? `${(value * 100).toFixed(0)}%`
    : `${Math.abs(value)}`;

  if (value > 0) return { text: `+${formatted}`, className: "text-green-500" };
  if (value < 0) return { text: `-${formatted}`, className: "text-red-500" };
  return { text: formatted, className: "text-white" };
};

const getSpriteUrl = (characterKey, frameIndex) => {
  const config = ANIMATION_SELECT_CHARACTER_CONFIGS[characterKey];
  const playerLayer = config.layers.find((l) => l.name === "front");
  const folderPath = playerLayer.folder.replace(/^\/sprites\//, "/sprites/");
  const paddedFrame = frameIndex.toString().padStart(3, "0");
  return `${folderPath}frame${paddedFrame}.png`;
};

// === MEMOIZED SPRITE URL GETTER ===
const useSpriteUrl = (characterKey, frame) => {
  return useMemo(
    () => getSpriteUrl(characterKey, frame),
    [characterKey, frame]
  );
};

// === ANIMATION HOOK (requestAnimationFrame) ===
const useAnimation = (characterKey, isActive) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isActive || !characterKey) {
      setFrame(0);
      return;
    }

    const config = ANIMATION_SELECT_CHARACTER_CONFIGS[characterKey];
    const layer = config.layers.find((l) => l.name === "front");
    const { frameCount, speed } = layer;

    let lastTime = 0;
    let animationId;

    const animate = (currentTime) => {
      if (currentTime - lastTime >= speed) {
        setFrame((prev) => (prev + 1) % frameCount);
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [characterKey, isActive]);

  return frame;
};

// === CHARACTER CARD (Main Grid) ===
const CharacterCard = memo(({ characterKey, isHovered, onHover, onSelect }) => {
  const frame = useAnimation(characterKey, isHovered);
  const spriteUrl = useSpriteUrl(characterKey, isHovered ? frame : 0);
  const baseName = characterKey.split("/")[0];

  return (
    <div
      className="relative w-32 h-42 bg-game-secondary rounded-lg overflow-hidden shadow-lg 
                 transform transition duration-300 hover:scale-105 cursor-pointer"
      onMouseEnter={() => onHover(characterKey)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(characterKey)}
    >
      <div
        className="relative w-32 h-32"
        style={{
          backgroundImage: `url(${spriteUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "auto",
        }}
      />
      <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-center py-2">
        <span className="text-white text-lg font-semibold capitalize">
          {baseName}
        </span>
      </div>
    </div>
  );
});

// === VARIANT CARD (Modal) ===
const VariantCard = memo(({ variantKey, modalFrame, onSelect }) => {
  const spriteUrl = useSpriteUrl(variantKey, modalFrame);
  const [baseName, variantName = "default"] = variantKey.split("/");
  const stats = CHARACTER_STATS[baseName]?.[variantName] || {};
  const special = stats.specials?.[0]
    ? SPECIALS.find((s) => s.id === stats.specials[0].specialId)
    : null;

  const displayName =
    variantName === "default" ? "Default" : formatVariantName(variantKey);

  const statLines = useMemo(() => {
    return Object.entries(stats).flatMap(([statKey, statValue]) => {
      if (statKey === "specials") return [];

      if (statKey === "rareStats") {
        return Object.entries(statValue).map(([subKey, subValue]) => {
          const { text, className } = formatStatValue(subKey, subValue);
          return (
            <p key={subKey} className={`font-medium ${className}`}>
              {formatStatName(subKey)}: {text}
            </p>
          );
        });
      }

      if (statKey === "consumables") {
        let items = [];
        if (
          statValue &&
          typeof statValue === "object" &&
          !Array.isArray(statValue)
        ) {
          items = Object.entries(statValue).map(([id, qty]) => ({
            id,
            quantity: qty,
          }));
        } else if (Array.isArray(statValue)) {
          items = statValue.map((i) =>
            typeof i === "string" ? { id: i, quantity: 1 } : i
          );
        } else if (typeof statValue === "string") {
          items = [{ id: statValue, quantity: 1 }];
        }

        return items
          .map((item, idx) => {
            const parts = item.id.split("_");
            if (parts.length < 3) return null;

            const [typeRaw, value, mode] = parts;
            const type = typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1);
            const displayValue = mode === "percent" ? `${value}%` : value;
            const name = `${type} ${displayValue} Potion`;

            return (
              <p
                key={`${item.id}-${idx}`}
                className="text-xs font-medium text-green-400"
              >
                {name}: <span className="text-green-300">+{item.quantity}</span>
              </p>
            );
          })
          .filter(Boolean);
      }

      const { text, className } = formatStatValue(statKey, statValue);
      return (
        <p key={statKey} className={`font-medium ${className}`}>
          {formatStatName(statKey)}: {text}
        </p>
      );
    });
  }, [stats]);

  return (
    <div
      className="bg-game-secondary rounded-lg overflow-hidden text-white cursor-pointer
                 transition-all duration-200 hover:ring-4 hover:ring-yellow-400 hover:scale-105
                 shadow-lg flex flex-col h-96"
      onClick={() => onSelect(variantKey)}
    >
      <div className="relative w-full h-40 bg-gradient-to-b from-transparent to-black/50 flex items-center justify-center overflow-hidden">
        <img
          src={spriteUrl}
          alt={variantKey}
          className="max-w-full max-h-full object-contain pointer-events-none select-none"
          style={{ imageRendering: "pixelated" }}
          loading="lazy"
        />
      </div>

      <div className="flex-1 flex flex-col px-3 pt-2">
        <h3 className="text-sm font-bold text-center h-10 flex items-center justify-center">
          {displayName}
        </h3>

        <div className="text-xs space-y-0.5 flex-1 overflow-y-auto max-h-28 px-1">
          {statLines}
        </div>

        {special && (
          <div className="mt-2 mb-2 border-t border-gray-600 pt-2 flex flex-col items-center">
            <img
              src={getSpecialIconPath(special.image)}
              alt={special.name}
              className="w-10 h-10 object-contain mb-1 special-icon"
              title={`${special.name}${
                special.usingType === "auto" ? " (Passive)" : ""
              }\n${special.effect}\nCooldown: ${special.cooldown}`}
            />
            <p className="text-xs font-semibold text-cyan-300 truncate w-full text-center drop-shadow-[0_0_1px_black]">
              {special.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// === MAIN COMPONENT ===
const CharacterSelection = () => {
  const navigate = useNavigate();
  const [hoveredCharacter, setHoveredCharacter] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const modalFrame = useAnimation(selectedCharacter, !!selectedCharacter);

  // Set min width
  useEffect(() => {
    document.body.style.minWidth = "425px";
    return () => {
      document.body.style.minWidth = "";
    };
  }, []);

  // Lọc default characters
  const defaultCharacters = useMemo(() => {
    return Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS)
      .filter((key) => key.endsWith("/default"))
      .sort((a, b) => a.localeCompare(b));
  }, []);

  // Lấy variants
  const variants = useMemo(() => {
    if (!selectedCharacter) return [];
    const baseName = selectedCharacter.split("/")[0];
    return Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS).filter(
      (k) => k === `${baseName}/default` || k.startsWith(`${baseName}/`)
    );
  }, [selectedCharacter]);

  // Handlers
  const handleSelectVariant = useCallback(
    (variantKey) => {
      navigate("/game", { state: { playerCharacter: variantKey } });
    },
    [navigate]
  );

  const handleSelectRandom = useCallback(() => {
    const allKeys = Object.keys(ANIMATION_SELECT_CHARACTER_CONFIGS);
    const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
    navigate("/game", { state: { playerCharacter: randomKey } });
  }, [navigate]);

  return (
    <div className="inline-flex flex-col items-center p-8 rounded-lg bg-game">
      <h1 className="text-4xl font-bold mb-8">Select Your Character</h1>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Random Card */}
        <div
          key="random"
          className="relative w-32 h-42 bg-game-secondary rounded-lg overflow-hidden shadow-lg 
                     transform transition duration-300 hover:scale-105 cursor-pointer"
          onClick={handleSelectRandom}
        >
          <img
            src="/question_mark.gif"
            alt="Random"
            className="w-32 h-32 object-contain"
          />
          <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-center py-2">
            <span className="text-white text-lg font-semibold">Random</span>
          </div>
        </div>

        {/* Default Characters */}
        {defaultCharacters.map((key) => (
          <CharacterCard
            key={key}
            characterKey={key}
            isHovered={hoveredCharacter === key}
            onHover={setHoveredCharacter}
            onSelect={setSelectedCharacter}
          />
        ))}
      </div>

      {/* MODAL */}
      {selectedCharacter && (
        <div
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-2000"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="bg-game rounded-lg p-6 w-full max-w-6xl relative flex flex-col max-h-full"
            style={{ maxHeight: "calc(100vh - 2rem)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-3xl text-white hover:text-red-400 z-10 
                         bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => setSelectedCharacter(null)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center capitalize pr-10">
              {selectedCharacter.split("/")[0]} Variants
            </h2>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-5 p-4">
                {variants.map((variantKey) => (
                  <VariantCard
                    key={variantKey}
                    variantKey={variantKey}
                    modalFrame={modalFrame}
                    onSelect={handleSelectVariant}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;
