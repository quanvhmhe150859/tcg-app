import React, { useState } from "react";
import { statIcons } from "../constants/statIcons";

const Header = ({ level }) => {
  const [openTips, setOpenTips] = useState(false);

  const statNames = Object.keys(statIcons);

  return (
    <div className="flex w-full">
      <div className="flex-1 text-left">
        <h1
          onClick={() => setOpenTips(true)}
          className="cursor-pointer relative z-30"
          title="Click for info"
        >
          🤔
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
              <ul className="list-none space-y-1 text-sm">
                {statNames.map((name) => {
                  const { icon, desc } = statIcons[name];
                  
                  return (
                    <li key={name}>
                      <span className="mr-2">{icon}</span>
                      <b className="hidden sm:inline">{name}</b>
                      <span>: {desc}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {level % 10 === 0 ? (
            <>
              <span className="hidden md:inline">
                <span className="text-red-500">Boss</span>
                <span className="text-white"> - </span>
              </span>
              <span className="md:text-inherit text-red-500">
                Level {level}
              </span>
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
