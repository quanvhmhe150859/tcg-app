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
import SkillsAndItemsPanel from "./components/SkillsAndItemsPanel";
import SpriteAnimation from "./animations/SpriteAnimation";
import SpriteSheetPlayer from "./animations/SpriteSheetPlayer";

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
      // playerSpriteRef.current.playAction("melee");
    }
    if (enemySpriteRef.current && enemy.currentHealth > 0) {
      enemySpriteRef.current.handlePlayOnce();
      // enemySpriteRef.current.playAction("melee");
    }
  };

  // Modified toggleAuto to trigger handleToggleLoop for both sprites
  const enhancedToggleAuto = () => {
    toggleAuto();
    if (playerSpriteRef.current) {
      playerSpriteRef.current.handleToggleLoop();
      // playerSpriteRef.current.toggleAutoAttack();
    }
    if (enemySpriteRef.current) {
      enemySpriteRef.current.handleToggleLoop();
      // enemySpriteRef.current.toggleAutoAttack();
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
    <div className="p-4 max-w-7xl md:min-h-[870px] mx-auto rounded-lg bg-game">
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
          <SkillsAndItemsPanel
            player={player}
            gameOver={gameOver}
            isAuto={isAuto}
            showUpgradeOptions={showUpgradeOptions}
            showShop={showShop}
            handleSpecial={handleSpecial}
            handleUseConsumable={handleUseConsumable}
          />
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
