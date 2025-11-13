import React, { useRef, useState, useEffect } from "react";
import SpriteSheetPlayer from "../../src/components/game/animations/SpriteSheetPlayer";
import SpriteAnimation from "../../src/components/game/animations/SpriteAnimation";

const Game = () => {
  const playerRef = useRef(null);
  const enemyRef = useRef(null);
  const [autoAttack, setAutoAttack] = useState(false);

  // 🔥 Gọi cả 2 nhân vật cùng lúc
  const syncAction = (fn) => {
    playerRef.current && fn(playerRef.current);
    enemyRef.current && fn(enemyRef.current);
  };

  const handleAttack = () => {
    syncAction(ref => ref.playAction("melee"));
  };

  const handleSpecial = () => {
    syncAction(ref => ref.playAction("special"));
  };

  const handleDeath = () => {
    syncAction(ref => ref.playAction("death"));
  };

  // 🔥 Toggle Auto Attack - SIÊU ĐƠN GIẢN
  const toggleAutoAttack = () => {
    const newState = !autoAttack;
    setAutoAttack(newState);
    
    syncAction(ref => {
      if (newState) {
        ref.toggleAutoAttack(); // Bật attack loop
      } else {
        ref.stopAutoAttack();   // Tắt về idle
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black bg-gradient-to-r from-red-400 via-pink-500 to-purple-600 
                       bg-clip-text text-transparent text-center mb-12 drop-shadow-2xl">
          ⚔️ BATTLE ARENA ⚔️
        </h1>

        {/* Arena */}
        <div className="flex justify-center items-end mb-16 gap-16 backdrop-blur-sm 
                       p-12 rounded-3xl">
          
          <div className="flex flex-col items-center space-y-4">
            <div className="text-2xl font-bold text-white drop-shadow-lg">👤 PLAYER</div>
            <SpriteSheetPlayer
              ref={playerRef}
              characterName="demon"
              defaultAction="idle"
              flipped={false}
            />
          </div>

          <div className="text-4xl font-black text-red-400 drop-shadow-2xl mb-8 rotate-12">VS</div>

          <div className="flex flex-col items-center space-y-4">
            <div className="text-2xl font-bold text-white drop-shadow-lg">💀 ENEMY</div>
            {/* <SpriteSheetPlayer
              ref={enemyRef}
              characterName="demon"
              defaultAction="idle"
              flipped={true}
            /> */}
            <SpriteAnimation
              name="random"
              flip={false}
              // ref={enemyRef}
              // distance={distance}
              // health={enemy.currentHealth}
            />
          </div>
        </div>

        {/* 🔥 Control Panel - 4 NÚT */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 
                       shadow-2xl max-w-2xl mx-auto">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            
            <button onClick={handleAttack}
                    className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-red-700 
                               text-white font-black text-lg rounded-2xl shadow-2xl 
                               hover:shadow-red-500/50 transition-all duration-300 
                               transform hover:scale-110 hover:-translate-y-2 active:scale-95">
              <span className="relative z-10">⚔️ ATTACK</span>
            </button>

            <button onClick={handleSpecial}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-700 
                               text-white font-black text-lg rounded-2xl shadow-2xl 
                               hover:shadow-purple-500/50 transition-all duration-300 
                               transform hover:scale-110 hover:-translate-y-2 active:scale-95">
              <span className="relative z-10">✨ SPECIAL</span>
            </button>

            <button onClick={handleDeath}
                    className="group relative px-8 py-4 bg-gradient-to-r from-gray-700 to-black 
                               text-white font-black text-lg rounded-2xl shadow-2xl 
                               hover:shadow-gray-600/50 transition-all duration-300 
                               transform hover:scale-110 hover:-translate-y-2 active:scale-95">
              <span className="relative z-10">💀 DEATH</span>
            </button>

            <button onClick={toggleAutoAttack}
                    className={`group relative px-8 py-4 font-black text-lg rounded-2xl shadow-2xl 
                               transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 
                               active:scale-95 ${
                                 autoAttack
                                   ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-red-500/50'
                                   : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/50'
                               }`}>
              <span className="relative z-10 text-white">
                {autoAttack ? '⏹️ STOP' : '🤖 AUTO'}
                <br />
                <span className="text-sm font-normal">ATTACK</span>
              </span>
            </button>
          </div>

          {/* Status */}
          <div className="mt-8 text-center">
            <span className="text-xl font-bold text-white">
              Auto Attack: 
              <span className={`ml-4 px-6 py-2 rounded-full text-xl font-black ${
                autoAttack 
                  ? 'bg-green-500/30 text-green-200 border-2 border-green-400' 
                  : 'bg-red-500/30 text-red-200 border-2 border-red-400'
              }`}>
                {autoAttack ? '🟢 ACTIVE' : '🔴 OFF'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;