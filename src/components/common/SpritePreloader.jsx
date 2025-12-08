// src/components/common/SpritePreloader.jsx
import React, { useState, useEffect } from "react";
import { ANIMATION_CONFIGS } from "../game/configs/spriteConfig";

const SPRITE_EXT = "png";
const SPRITE_PAD = 3;

export default function SpritePreloader({ children }) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFrames, setTotalFrames] = useState(0);
  const [loadedFrames, setLoadedFrames] = useState(0);

  useEffect(() => {
    let mounted = true;
    const imagePromises = [];
    let total = 0;

    // Tính tổng số frame cần tải
    Object.values(ANIMATION_CONFIGS).forEach((config) => {
      const layers = config.layers || [];
      layers.forEach((layer) => {
        total += layer.frameCount || 0;
      });
    });

    if (total === 0) {
      setIsLoading(false);
      return;
    }

    setTotalFrames(total);

    // Tạo promise cho từng frame
    Object.entries(ANIMATION_CONFIGS).forEach(([name, config]) => {
      const layers = config.layers || [];
      layers.forEach((layer) => {
        for (let i = 0; i < layer.frameCount; i++) {
          const num = i.toString().padStart(SPRITE_PAD, "0");
          const src = `${layer.folder}frame${num}.${SPRITE_EXT}`;

          const promise = new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = () => {
              if (mounted) {
                setLoadedFrames((prev) => {
                  const newCount = prev + 1;
                  setProgress(Math.round((newCount / total) * 100));
                  return newCount;
                });
              }
              resolve();
            };
            img.src = src;
          });

          imagePromises.push(promise);
        }
      });
    });

    // Khi tất cả load xong
    Promise.all(imagePromises).then(() => {
      if (mounted) {
        setTimeout(() => {
          setIsLoading(false);
        }, 300); // delay nhẹ cho đẹp
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!isLoading) return children;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2 tracking-wider">
          BATTLE ARENA
        </h1>
        <p className="text-gray-300 text-lg">Đang chuẩn bị chiến trường...</p>
      </div>

      <div className="w-96 max-w-full px-8">
        <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden shadow-2xl">
          <div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xl drop-shadow-lg">
              {progress}%
            </span>
          </div>
        </div>
        <p className="text-center text-gray-400 mt-3 text-sm">
          Đã tải {loadedFrames} / {totalFrames} frame
        </p>
      </div>

      <div className="flex gap-4 text-gray-500 text-sm">
        <span>Tip: Đừng thoát trang nhé!</span>
      </div>
    </div>
  );
}