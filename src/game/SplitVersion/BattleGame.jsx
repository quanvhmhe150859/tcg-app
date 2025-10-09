import React, { useState, useEffect, useRef } from "react";
import { initPlayer, initEnemy } from "./initializers";
import { useTickets } from "../../components/context/TicketContext";
import StatsPanel from "./components/StatsPanel";
import BattleLog from "./components/BattleLog";
import UpgradePanel from "./components/UpgradePanel";
import ShopPanel from "./components/ShopPanel";
import GameControls from "./components/GameControls";
import Header from "./components/Header";
import ToggleButtons from "./components/ToggleButtons";
import useGameLogic from "./hooks/useGameLogic";

import SpriteAnimation from "./animations/SpriteAnimation";

const BattleGame = () => {
  const { earnTickets } = useTickets();

  const [player, setPlayer] = useState(initPlayer());
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
  const [autoSpeed, setAutoSpeed] = useState(150);
  const logContainerRef = useRef(null);
  const playerSpriteRef = useRef(null);
  const enemySpriteRef = useRef(null);

  const {
    handlePurchase,
    handleReroll,
    handleExitShop,
    handleUpgrade,
    endGame,
    handleEndRun,
    handleAttack,
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
        handleAttack();
      }, autoSpeed);

      return () => clearInterval(interval);
    }
  }, [isAuto, gameOver, showUpgradeOptions, showShop, player, enemy, turnCount, level, autoSpeed]);

  const toggleRareStats = () => {
    setShowRareStats((prev) => !prev);
  };

  const toggleNormalStats = () => {
    setShowNormalStats((prev) => !prev);
  };

  // Modified handleAttack to trigger handlePlayOnce for both sprites
  const enhancedHandleAttack = () => {
    handleAttack();
    if (playerSpriteRef.current) {
      playerSpriteRef.current.handlePlayOnce();
    }
    if (enemySpriteRef.current) {
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

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg bg-game">
      <Header level={level} />

      <div className="flex justify-between items-center gap-4">
        <SpriteAnimation name="agathe" ref={playerSpriteRef} distance={distance} health={player.currentHealth}/>
        <SpriteAnimation name="bardrey" ref={enemySpriteRef} distance={distance} health={enemy.currentHealth}/>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatsPanel entity={player} name="Player" showNormalStats={showNormalStats} showRareStats={showRareStats} />
        <StatsPanel entity={enemy} name="Enemy" showNormalStats={showNormalStats} showRareStats={showRareStats} />
      </div>
      <ToggleButtons
        showNormalStats={showNormalStats}
        showRareStats={showRareStats}
        toggleNormalStats={toggleNormalStats}
        toggleRareStats={toggleRareStats}
      />
      <p className="text-center text-yellow-500 mb-4">Gold: {player.gold}</p>
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
      <BattleLog turnLogs={turnLogs} logContainerRef={logContainerRef} />
    </div>
  );
};

export default BattleGame;