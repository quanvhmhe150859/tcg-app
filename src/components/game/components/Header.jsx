import React, { useState, useEffect } from "react";
import { statIcons } from "../constants/stats";
import { effectIcons } from "../constants/effects";

const Header = ({ level, editMode, setEditMode }) => {
  const [openTips, setOpenTips] = useState(false);
  const [activeTab, setActiveTab] = useState("Stats");
  const [selectedItem, setSelectedItem] = useState(null); // Cho mobile modal
  const [isMobile, setIsMobile] = useState(false);

  const statNames = Object.keys(statIcons);
  const effectNames = Object.keys(effectIcons);

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Xử lý click icon trong modal mobile
  const handleIconClick = (name, type) => {
    const key = `${type}-${name}`;
    setSelectedItem(selectedItem === key ? null : key);
  };

  return (
    <div className="flex w-full">
      <div className="flex-1 text-left">
        <h1
          onClick={() => setOpenTips(true)}
          className="cursor-pointer relative z-300"
          title="Click for info"
        >
          🤔
        </h1>

        {/* === MODAL === */}
        {openTips && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-2000"
            onClick={() => {
              setOpenTips(false);
              setSelectedItem(null); // Reset khi đóng
            }}
          >
            <div
              className="bg-game-secondary rounded-lg shadow-lg p-6 m-4 max-w-2xl w-full max-h-[80vh] relative overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setOpenTips(false);
                  setSelectedItem(null);
                }}
                className="absolute top-2 right-2 z-10 text-xl"
              >
                ✖
              </button>

              {/* === MOBILE: Hiển thị danh sách icon === */}
              {isMobile ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-center mb-3">
                    Information
                  </h2>

                  {/* Danh sách icon */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {statNames.map((name) => {
                      const { icon } = statIcons[name];
                      return (
                        <button
                          key={`stat-${name}`}
                          onClick={() => handleIconClick(name, "stat")}
                          className="text-2xl hover:scale-125 transition-transform p-1"
                          title={name}
                        >
                          {icon}
                        </button>
                      );
                    })}
                    {effectNames.map((name) => {
                      const { icon } = effectIcons[name];
                      return (
                        <button
                          key={`effect-${name}`}
                          onClick={() => handleIconClick(name, "effect")}
                          className="text-2xl hover:scale-125 transition-transform p-1"
                          title={name}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>

                  {/* Hiển thị giải thích khi chọn */}
                  {selectedItem && (
                    <div className="mt-4 p-3 rounded-lg border border-gray-400 text-sm">
                      {(() => {
                        const [type, name] = selectedItem.split("-");
                        const data =
                          type === "stat" ? statIcons[name] : effectIcons[name];
                        if (!data) return null;
                        return (
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">{data.icon}</span>
                            <div>
                              <b className="text-base">{name}</b>
                              <p className="mt-1">{data.desc}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                /* === DESKTOP: Giữ nguyên giao diện cũ === */
                <div className="flex gap-4" style={{ height: "75vh" }}>
                  {/* Sidebar */}
                  <div className="flex flex-col border-r border-gray-400 pr-4">
                    <button
                      onClick={() => setActiveTab("Stats")}
                      className={`py-2 px-3 text-left font-semibold rounded transition-colors ${
                        activeTab === "Stats" ? "selected-tab" : ""
                      }`}
                    >
                      <span className="md:inline hidden">Stats</span>
                      <span className="md:hidden">📜</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("Effects")}
                      className={`py-2 px-3 text-left font-semibold rounded transition-colors mt-1 ${
                        activeTab === "Effects" ? "selected-tab" : ""
                      }`}
                    >
                      <span className="md:inline hidden">Effects</span>
                      <span className="md:hidden">✨</span>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto pr-2">
                    <h2 className="text-xl font-bold mb-2 sticky top-0 bg-game-secondary pb-2 -mx-2 px-2">
                      {activeTab === "Stats"
                        ? "Stats Explanation"
                        : "Effects Explanation"}
                    </h2>

                    <ul className="list-none space-y-2 text-sm">
                      {activeTab === "Stats" &&
                        statNames.map((name) => {
                          const { icon, desc } = statIcons[name];
                          return (
                            <li key={name} className="flex items-start">
                              <span className="mr-2 w-6">{icon}</span>
                              <div>
                                <b className="hidden sm:inline">{name}</b>
                                <span>: {desc}</span>
                              </div>
                            </li>
                          );
                        })}

                      {activeTab === "Effects" &&
                        effectNames.map((name) => {
                          const { icon, desc } = effectIcons[name];
                          return (
                            <li key={name} className="flex items-start">
                              <span className="mr-2 w-6">{icon}</span>
                              <div>
                                <b className="hidden sm:inline">{name}</b>
                                <span>: {desc}</span>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Level */}
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
      <div className="flex-1 text-right">
        <h1
          onClick={() => setEditMode((v) => !v)}
          className={`cursor-pointer relative z-300`}
          title={editMode ? "Done" : "Click for Rearrange Layout"}
        >
          {editMode ? "🔨" : "📐"}
        </h1>
      </div>
    </div>
  );
};

export default Header;
