import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Homepage = () => {
  const { t } = useTranslation();

  const [isGachaClicked, setIsGachaClicked] = useState(false);
  const [visibleButtons, setVisibleButtons] = useState([false, false, false]);
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    // Hiển thị từng nút lần lượt khi trang tải
    const timers = [
      setTimeout(() => setVisibleButtons([true, false, false]), 0),
      setTimeout(() => setVisibleButtons([true, true, false]), 250),
      setTimeout(() => setVisibleButtons([true, true, true]), 500),
    ];
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const buttonStyles = [
    {
      label: t("settings"),
      path: "/settings",
      backgroundImage: "url(/bg/settings-bg.png)",
      backgroundVideo: "/bg/settings-video.mp4",
    },
    {
      label: t("game"),
      path: "/character-selection",
      backgroundImage: "url(/bg/game-bg.png)",
      backgroundVideo: "/bg/game-video.mp4",
    },
    {
      label: "Gacha",
      path: "#",
      backgroundImage: "url(/bg/gacha-bg.png)",
      backgroundVideo: "/bg/gacha-video.mp4",
    },
  ];

  const gachaSubButtons = [
    {
      label: "Pokémon",
      path: "/pokemon",
      backgroundImage: "url(/bg/pokemon-bg.png)",
      backgroundVideo: "/bg/pokemon-video.mp4",
    },
    {
      label: "Yu-Gi-Oh!",
      path: "/yugioh",
      backgroundImage: "url(/bg/yugioh-bg.png)",
      backgroundVideo: "/bg/yugioh-video.mp4",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <img
        src="/bg/logo-tcg.png"
        alt="TCG Logo"
        className="h-auto w-auto max-h-24 md:max-h-32 lg:max-h-40 object-contain drop-shadow-[0_0_3px_black]"
      />
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        {buttonStyles.map((button, index) => (
          <div
            key={button.label}
            className="relative"
            onClick={() =>
              button.label === "Gacha" && setIsGachaClicked(!isGachaClicked)
            }
          >
            {button.label === "Gacha" && isGachaClicked ? (
              <div className="flex flex-row space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2 h-[24vh] sm:h-[70vh] sm:w-[20vw]">
                {gachaSubButtons.map((subButton) => (
                  <Link
                    key={subButton.label}
                    to={subButton.path}
                    className="flex-1 text-white rounded-lg transition-all duration-300 transform hover:scale-105 text-2xl font-semibold flex items-center justify-center relative overflow-hidden"
                    onMouseEnter={() => setHoveredButton(subButton.label)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                      backgroundImage: subButton.backgroundImage,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {hoveredButton === subButton.label && (
                      <video
                        className="absolute inset-0 w-full h-full object-cover"
                        src={subButton.backgroundVideo}
                        autoPlay
                        loop
                        muted
                      />
                    )}
                    <span className="relative z-10 drop-shadow-[0_0_3px_black] text-xl">
                      {subButton.label}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                to={button.path}
                className={`h-[24vh] sm:h-[70vh] sm:w-[24vw] text-white rounded-lg transition-all duration-300 transform hover:scale-105 text-2xl font-semibold flex items-center justify-center relative overflow-hidden ${
                  visibleButtons[index] ? "animate-fadeIn" : "opacity-0"
                }`}
                style={{
                  backgroundImage: button.backgroundImage,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onMouseEnter={() => setHoveredButton(button.label)}
                onMouseLeave={() => setHoveredButton(null)}
              >
                {hoveredButton === button.label && (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={button.backgroundVideo}
                    autoPlay
                    loop
                    muted
                  />
                )}
                <span className="relative z-10 drop-shadow-[0_0_3px_black] text-3xl">
                  {button.label}
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// CSS cho animation được thêm trực tiếp vào component
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
    }
`;
document.head.appendChild(style);

export default Homepage;