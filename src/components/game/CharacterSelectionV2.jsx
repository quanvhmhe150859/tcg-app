import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CardItem.css";

// === SPRITE SHEET ANIMATION HOOK ===
const useSpriteSheetAnimation = (config) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!config || !config.loop) return;

    const { frameCount, speed } = config;
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
  }, [config]);

  return frame;
};

// === CHARACTER DATA HELPER ===
const loadCharacterData = async () => {
  const response = await fetch("/data/character/");
  const files = await response.json(); // Giả sử API trả về danh sách files
  const characters = {};

  for (const file of files) {
    try {
      const data = await import(`/data/character/${file}`);
      characters[file.replace(".json", "")] = data.default || data;
    } catch (e) {
      console.warn(`Failed to load ${file}`);
    }
  }

  return characters;
};

// === CHARACTER CARD (V2 - Sprite Sheet + Idle Only) ===
const CharacterCard = memo(({ characterName, config, onSelect }) => {
  const idleConfig = config.idle;
  const currentFrame = useSpriteSheetAnimation(idleConfig);

  // Tính toán vị trí frame trong sprite sheet (chỉ để cắt)
  const frameX = (currentFrame % idleConfig.columns) * idleConfig.frameWidth;
  const frameY =
    Math.floor(currentFrame / idleConfig.columns) * idleConfig.frameHeight;

  const spriteStyle = {
    width: `${idleConfig.frameWidth}px`,
    height: `${idleConfig.frameHeight}px`,
    backgroundImage: `url(${idleConfig.image})`,
    backgroundPosition: `-${frameX}px -${frameY}px`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${idleConfig.columns * idleConfig.frameWidth}px auto`,
    imageRendering: "pixelated",
  };

  return (
    <div
      className="relative w-32 h-42 bg-game-secondary rounded-lg overflow-hidden shadow-lg 
                 transform transition duration-300 hover:scale-105 cursor-pointer select-none"
      onClick={() => onSelect(characterName)}
    >
      {/* Khu vực hiển thị sprite - 128x128px */}
      <div className="relative w-full h-32 flex items-center justify-center overflow-hidden bg-transparent">
        <div style={spriteStyle} className="mx-auto" />
      </div>

      <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-center py-2">
        <span className="text-white text-lg font-semibold">
          {characterName
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>
    </div>
  );
});

// === MAIN COMPONENT ===
const CharacterSelectionV2 = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all character data
  useEffect(() => {
    const loadData = async () => {
      try {
        const modules = import.meta.glob("./data/characters/*.json", {
          eager: false,
        });
        const characters = {};

        for (const path in modules) {
          const mod = await modules[path]();
          const name = path.split("/").pop().replace(".json", "");
          characters[name] = mod.default || mod;
        }

        setCharacters(characters);
      } catch (error) {
        console.error("Failed to load character data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Random select
  const handleSelectRandom = useCallback(() => {
    const characterNames = Object.keys(characters);
    if (characterNames.length === 0) return;

    const randomName =
      characterNames[Math.floor(Math.random() * characterNames.length)];
    navigate("/game", { state: { playerCharacter: randomName } });
  }, [characters, navigate]);

  // Select character
  const handleSelectCharacter = useCallback(
    (characterName) => {
      navigate("/game", { state: { playerCharacter: characterName } });
    },
    [navigate]
  );

  // Set min width
  useEffect(() => {
    document.body.style.minWidth = "425px";
    return () => {
      document.body.style.minWidth = "";
    };
  }, []);

  if (loading) {
    return (
      <div className="inline-flex flex-col items-center p-8 rounded-lg bg-game min-h-screen">
        <div className="text-4xl font-bold mb-8 text-white">
          Loading Characters...
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center p-8 rounded-lg bg-game min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Select Your Character</h1>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Random Card */}
        <div
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

        {/* Character Cards */}
        {Object.entries(characters).map(([name, config]) => (
          <CharacterCard
            key={name}
            characterName={name}
            config={config}
            onSelect={handleSelectCharacter}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterSelectionV2;
