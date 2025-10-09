import React, { useState } from "react";

const Header = ({ level }) => {
  const [openTips, setOpenTips] = useState(false);

  return (
    <div className="flex w-full">
      <div className="flex-1 text-left">
        <h1
          onClick={() => setOpenTips(true)}
          className="cursor-pointer"
          title="Click for info"
        >
          💡
        </h1>

        {openTips && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-game-secondary rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                onClick={() => setOpenTips(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
              >
                ✖
              </button>

              <h2 className="text-xl font-bold mb-4">Stats Explanation</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <b>Health</b>: Maximum hit points. If it reaches 0, you die.
                </li>
                <li>
                  <b>Regeneration</b>: Amount of HP recovered each turn.
                </li>
                <li>
                  <b>Armor</b>: Reduces incoming physical damage.
                </li>
                <li>
                  <b>Attack</b>: Base damage dealt to enemies.
                </li>
                <li>
                  <b>Crit Chance</b>: Probability of landing a critical hit.
                </li>
                <li>
                  <b>Crit Damage</b>: Extra damage multiplier when a crit
                  occurs.
                </li>
                <li>
                  <b>Life Steal</b>: Portion of damage dealt returned as HP.
                </li>
                <li>
                  <b>Dodge</b>: Chance to completely avoid an attack.
                </li>
                <li>
                  <b>Gold</b>: Currency used to buy upgrades or items.
                </li>
                <li>
                  <b>Burn</b>: Deals fixed damage at the end of each turn.
                </li>
                <li>
                  <b>Poison</b>: Deals damage each turn and increases over
                  time.
                </li>
                <li>
                  <b>Thorn</b>: Deals fixed damage back to the attacker when
                  hit by an attack.
                </li>
                <li>
                  <b>Counterattack</b>: Chance to attack back at the attacker
                  when hit.
                </li>
                <li>
                  <b>Stun Chance</b>: Probability of disabling the enemy for
                  one turn.
                </li>
                <li>
                  <b>Swiftness</b>: Chance to perform a second attack in the
                  same turn.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {level % 10 === 0 ? (
            <>
              <span className="text-red-500">Boss</span> - Level {level}
            </>
          ) : (
            <>Level {level}</>
          )}
        </h1>
      </div>
      <div className="flex-1 text-right"></div>
    </div>
  );
};

export default Header;