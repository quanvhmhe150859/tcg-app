import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initPlayer, initEnemy } from "./logic/initializers";
import { useTickets } from "../../context/TicketContext";
import StatsPanel from "./components/StatsPanel";
import BattleLog from "./components/BattleLog";
import UpgradePanel from "./components/UpgradePanel";
import ShopPanel from "./components/ShopPanel";
import GameControls from "./components/GameControls";
import Header from "./components/Header";
import ToggleButtons from "./components/ToggleButtons";
import useGameLogic from "./hooks/useGameLogic";
import SpriteAnimation from "./animations/SpriteAnimation";
import SpriteSheetPlayer from "./animations/SpriteSheetPlayer";

import { SPECIALS } from "./constants/specials";
import { getSpecialIconPath } from "./configs/specialConfig";
import { getConsumableIconPath } from "./configs/consumableConfig";

const BattleGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerCharacter = location.state?.playerCharacter;
  const enemyCharacter = "random";

  useEffect(() => {
    if (!playerCharacter) {
      navigate("/character-selection");
    }
  }, [playerCharacter, navigate]);

  useEffect(() => {
    document.body.style.minWidth = "425px";

    return () => {
      document.body.style.minWidth = ""; // reset khi rời trang
    };
  }, []);

  const { earnTickets } = useTickets();

  // Initialize player with selected character stats
  const [player, setPlayer] = useState(
    playerCharacter === "random" ? initPlayer() : initPlayer(playerCharacter)
  );
  const [enemy, setEnemy] = useState(initEnemy(1));
  const [turnLogs, setTurnLogs] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [globalTurnCount, setGlobalTurnCount] = useState(1);
  const [logId, setLogId] = useState(1);
  const [level, setLevel] = useState(1);
  const [isAuto, setIsAuto] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [upgradeOptions, setUpgradeOptions] = useState([]);
  const [isRareUpgrade, setIsRareUpgrade] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopOptions, setShopOptions] = useState([]);
  const [rerollPrice, setRerollPrice] = useState(50);
  const [boughtOptions, setBoughtOptions] = useState([]);
  const [showRareStats, setShowRareStats] = useState(false);
  const [showNormalStats, setShowNormalStats] = useState(false);

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    setShowRareStats(isDesktop);
    setShowNormalStats(isDesktop);
  }, []);

  const [autoSpeed, setAutoSpeed] = useState(150);
  const logContainerRef = useRef(null);
  const playerSpriteRef = useRef(null);
  const enemySpriteRef = useRef(null);

  const {
    handlePurchase,
    handleReroll,
    handleExitShop,
    handleUpgrade,
    handleEndRun,
    handleAttack,
    handleSpecial,
    handleAutoTurn,
    handleUseConsumable,
    toggleAuto,
    resetGame,
  } = useGameLogic({
    playerState: { player, setPlayer },
    enemyState: { enemy, setEnemy },
    gameState: {
      turnLogs,
      setTurnLogs,
      gameOver,
      setGameOver,
      turnCount,
      setTurnCount,
      globalTurnCount,
      setGlobalTurnCount,
      logId,
      setLogId,
      level,
      setLevel,
      isAuto,
      setIsAuto,
      showUpgradeOptions,
      setShowUpgradeOptions,
    },
    shopState: {
      upgradeOptions,
      setUpgradeOptions,
      isRareUpgrade,
      setIsRareUpgrade,
      showShop,
      setShowShop,
      shopOptions,
      setShopOptions,
      rerollPrice,
      setRerollPrice,
      boughtOptions,
      setBoughtOptions,
    },
    earnTickets,
  });

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [turnLogs]);

  useEffect(() => {
    if (isAuto && !gameOver && !showUpgradeOptions && !showShop) {
      const interval = setInterval(() => {
        handleAutoTurn();
      }, autoSpeed);

      return () => clearInterval(interval);
    }
  }, [
    isAuto,
    gameOver,
    showUpgradeOptions,
    showShop,
    player,
    enemy,
    turnCount,
    level,
    autoSpeed,
  ]);

  const toggleRareStats = () => {
    setShowRareStats((prev) => !prev);
  };

  const toggleNormalStats = () => {
    setShowNormalStats((prev) => !prev);
  };

  // Modified handleAttack to trigger handlePlayOnce for both sprites
  const enhancedHandleAttack = () => {
    handleAutoTurn();
    if (playerSpriteRef.current && player.currentHealth > 0) {
      playerSpriteRef.current.handlePlayOnce();
    }
    if (enemySpriteRef.current && enemy.currentHealth > 0) {
      enemySpriteRef.current.handlePlayOnce();
    }
  };

  // Modified toggleAuto to trigger handleToggleLoop for both sprites
  const enhancedToggleAuto = () => {
    toggleAuto();
    if (playerSpriteRef.current) {
      playerSpriteRef.current.handleToggleLoop();
    }
    if (enemySpriteRef.current) {
      enemySpriteRef.current.handleToggleLoop();
    }
  };

  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const playerEl = playerSpriteRef.current?.getElement?.();
      const enemyEl = enemySpriteRef.current?.getElement?.();
      if (!playerEl || !enemyEl) return;

      const rect1 = playerEl.getBoundingClientRect();
      const rect2 = enemyEl.getBoundingClientRect();
      const x1 = rect1.left + rect1.width / 2;
      const x2 = rect2.left + rect2.width / 2;
      setDistance(Math.abs(x2 - x1).toFixed(1));
    };

    measure();
    window.addEventListener("resize", measure);
    const interval = setInterval(measure, 100);
    return () => {
      window.removeEventListener("resize", measure);
      clearInterval(interval);
    };
  }, []);

  // Stop sprite animations and setIsAuto(false) when gameOver
  useEffect(() => {
    if (gameOver) {
      if (playerSpriteRef.current) {
        playerSpriteRef.current.handlePlayOnce();
      }
      if (enemySpriteRef.current) {
        enemySpriteRef.current.handlePlayOnce();
      }
    }
  }, [gameOver]);

  return (
    <div className="p-4 max-w-7xl md:min-h-[825px] mx-auto rounded-lg bg-game">
      <Header level={level} />

      <div className="flex flex-col md:flex-row md:gap-4">
        {/* Left column: Sprites and Stats (always on top in portrait, left in landscape) */}
        <div className="flex-1">
          <div className="rounded-md bg-game-animate">
            <SpriteAnimation
              name={playerCharacter}
              flip={true}
              ref={playerSpriteRef}
              distance={distance}
              health={player.currentHealth}
            />
            {/* <SpriteSheetPlayer
              characterName={playerCharacter}
              flipped={false}
              ref={playerSpriteRef}
              distance={distance}
              health={player.currentHealth}
            /> */}
            <SpriteAnimation
              name={enemyCharacter}
              flip={false}
              ref={enemySpriteRef}
              distance={distance}
              health={enemy.currentHealth}
            />
            {/* <SpriteSheetPlayer
              characterName={enemyCharacter}
              flipped={true}
              ref={enemySpriteRef}
              distance={distance}
              health={enemy.currentHealth}
            /> */}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatsPanel
              entity={player}
              name="Player"
              showNormalStats={showNormalStats}
              showRareStats={showRareStats}
            />
            <StatsPanel
              entity={enemy}
              name="Enemy"
              showNormalStats={showNormalStats}
              showRareStats={showRareStats}
            />
          </div>
          <ToggleButtons
            showNormalStats={showNormalStats}
            showRareStats={showRareStats}
            toggleNormalStats={toggleNormalStats}
            toggleRareStats={toggleRareStats}
          />
          <div className="grid grid-cols-[40%_60%] text-xs sm:text-sm">
            <p className="text-green-500">Luck: {player.luck} 🍀</p>
            <p className="text-yellow-500">Gold: {player.gold} 💰</p>
          </div>
          {/* ==================== SPECIAL + CONSUMABLES (CÙNG DÒNG) ==================== */}
          <p className="font-semibold mt-4 mb-1 border-t border-gray-500 pt-2">
            Skills & Items
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {/* --- Special Skills --- */}
            {player.specials?.map((special, index) => {
              const specialData = SPECIALS.find(
                (s) => s.id === special.specialId
              );
              if (!specialData) return null;

              const isOnCooldown = special.currentCooldown > 0;
              const isPassive = specialData.usingType === "auto";

              return (
                <button
                  key={`special-${index}`}
                  onClick={() => !isPassive && handleSpecial(special.specialId)}
                  disabled={
                    isOnCooldown ||
                    gameOver ||
                    showUpgradeOptions ||
                    showShop ||
                    isAuto ||
                    isPassive
                  }
                  className={`
                    relative w-14 h-10 sm:w-16 sm:h-12
                    rounded-lg border-2 overflow-hidden
                    transition-all duration-200
                    ${
                      isOnCooldown
                        ? "opacity-50 grayscale border-gray-500 !cursor-not-allowed"
                        : isPassive
                        ? "border-purple-400 opacity-80"
                        : "border-yellow-400 hover:scale-110 hover:border-yellow-300 shadow-lg"
                    }
                    ${
                      gameOver ||
                      showUpgradeOptions ||
                      showShop ||
                      isAuto ||
                      isPassive
                        ? "!cursor-not-allowed"
                        : ""
                    }
                  `}
                  title={
                    `${specialData.name}${isPassive ? " (Passive)" : ""}\n` +
                    `${
                      typeof specialData.effect === "function"
                        ? specialData.effect(specialData.power)
                        : specialData.effect
                    }\n` +
                    `Cooldown: ${special?.currentCooldown ?? 0}/${
                      specialData.cooldown
                    }`
                  }
                >
                  <img
                    src={getSpecialIconPath(specialData.image)}
                    alt={specialData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default.jpg";
                    }}
                  />
                  {isOnCooldown && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-xs font-bold">
                      {special.currentCooldown}
                    </div>
                  )}
                </button>
              );
            })}

            {/* --- Consumables --- */}
            {(() => {
              const consumables = player.consumables;

              // Chỉ xử lý nếu consumables là object (không phải mảng)
              if (
                !consumables ||
                typeof consumables !== "object" ||
                Array.isArray(consumables)
              ) {
                return null; // hoặc return <div className="text-gray-500 text-xs">No items</div>;
              }

              return Object.entries(consumables)
                .map(([id, quantity], index) => {
                  const hasQuantity = quantity > 0;

                  // Parse tên: health_500_fixed → "Health 500 Potion"
                  const parts = id.split("_");
                  if (parts.length < 3) return null;

                  const type =
                    parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                  const value = parts[1];
                  const mode = parts[2];
                  const displayValue = mode === "percent" ? `${value}%` : value;
                  const itemName = `${type} ${displayValue} Potion`;

                  return (
                    <button
                      key={`consumable-${id}`}
                      onClick={() => {
                        if (hasQuantity && !gameOver && type != "Revive") {
                          handleUseConsumable(id);
                        }
                      }}
                      disabled={!hasQuantity || gameOver || type == "Revive"}
                      className={`
                        relative w-14 h-10 sm:w-16 sm:h-12
                        rounded-lg border-2 overflow-hidden
                        transition-all duration-200
                        ${
                          !hasQuantity
                            ? "opacity-30 grayscale border-gray-600"
                            : "border-cyan-400 hover:scale-110 hover:border-cyan-300 shadow-lg"
                        }
                        ${
                          gameOver || type == "Revive"
                            ? "!cursor-not-allowed"
                            : ""
                        }
                      `}
                      title={itemName}
                    >
                      <img
                        src={getConsumableIconPath(id)}
                        alt={id}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/default.jpg";
                        }}
                      />

                      {/* Số lượng */}
                      {hasQuantity ? (
                        <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl">
                          {quantity}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-xs font-bold">
                          0
                        </div>
                      )}
                    </button>
                  );
                })
                .filter(Boolean);
            })()}
          </div>
        </div>

        {/* Right column: Gold, Controls, Panels, and Log (below in portrait, right in landscape) */}
        <div className="flex-1 flex flex-col md:flex-col">
          <div className="order-2 md:order-1 mt-4 md:mt-0">
            <BattleLog turnLogs={turnLogs} logContainerRef={logContainerRef} />
          </div>
          <div className="order-1 md:order-2 mt-4">
            <GameControls
              isAuto={isAuto}
              toggleAuto={enhancedToggleAuto}
              handleAttack={enhancedHandleAttack}
              handleEndRun={handleEndRun}
              autoSpeed={autoSpeed}
              setAutoSpeed={setAutoSpeed}
              min={100}
              max={1000}
              step={50}
              gameOver={gameOver}
              showUpgradeOptions={showUpgradeOptions}
              showShop={showShop}
              resetGame={resetGame}
            />
            {showUpgradeOptions && (
              <UpgradePanel
                isRareUpgrade={isRareUpgrade}
                upgradeOptions={upgradeOptions}
                handleUpgrade={handleUpgrade}
              />
            )}
            {showShop && (
              <ShopPanel
                shopOptions={shopOptions}
                boughtOptions={boughtOptions}
                player={player}
                handlePurchase={handlePurchase}
                rerollPrice={rerollPrice}
                handleReroll={handleReroll}
                handleExitShop={handleExitShop}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleGame;
