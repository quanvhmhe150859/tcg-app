import React, { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { ANIMATION_CONFIGS } from "./animationConstants";

/**
 * MultiSpriteAnimation
 * - Nhiều layer sprite song song
 * - Mỗi layer có frameCount, speed, delay, flip, moving, stopMovingAtFrame, moveStopDistance, movingFrameCount riêng
 * - Có 2 nút: "Bắt đầu" (1 lượt) và "Lặp / Dừng lặp"
 * - Hỗ trợ gọi animation bằng tên từ ANIMATION_CONFIGS
 * - moving: true thì layer di chuyển (sang trái nếu flip=false, sang phải nếu flip=true)
 * - stopMovingAtFrame: nếu moving=true, layer dừng di chuyển tại frame được chỉ định
 * - moveStopDistance: nếu moving=true, layer dừng di chuyển sau khi di chuyển khoảng cách chỉ định (pixel)
 * - movingFrameCount: nếu moving=true và moveStopDistance, số frame cho giai đoạn di chuyển (tự động điều chỉnh speed cho giai đoạn này)
 */
const MultiSpriteAnimation = forwardRef(({
  name,
  layers = [],
  pad = 3,
  ext = "png",
  width = 128,
  height = 128,
  ...rest
}, ref) => {
  // ✅ Lấy config từ ANIMATION_CONFIGS nếu có name, merge với props
  const config = name && ANIMATION_CONFIGS[name] ? ANIMATION_CONFIGS[name] : {};
  const finalLayers = config.layers || layers;
  const finalWidth = config.width || width;
  const finalHeight = config.height || height;

  // ✅ Hàm lấy indices ban đầu (xử lý delay)
  const getInitialIndices = () => {
    return finalLayers.map((layer) => (layer.delay > 0 ? null : 0));
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [indices, setIndices] = useState(getInitialIndices());
  const [translateX, setTranslateX] = useState(0); // Track horizontal position for moving layers
  const [stopPositions, setStopPositions] = useState(
    finalLayers.map(() => null) // Store stopping position for each layer
  );

  const frameReq = useRef(null);
  const startTime = useRef(0);

  // ✅ Tạo danh sách frame cho từng layer
  const allFrames = useMemo(() => {
    return finalLayers.map((layer) =>
      Array.from({ length: layer.frameCount }, (_, j) => {
        const num = j.toString().padStart(pad, "0");
        return `${layer.folder}frame${num}.${ext}`;
      })
    );
  }, [finalLayers, pad, ext]);

  // ✅ Tính toán totalDuration (điều chỉnh nếu có movingFrameCount và moveStopDistance)
  const totalDuration = useMemo(() => {
    return Math.max(
      ...finalLayers.map((l) => {
        if (l.moving && l.moveStopDistance && l.movingFrameCount) {
          const moveSpeed = 300; // pixels per second (có thể lấy từ global hoặc prop nếu cần)
          const movingDuration = (l.moveStopDistance / moveSpeed) * 1000;
          const movingSpeed = movingDuration / l.movingFrameCount;
          const explosionFrameCount = l.frameCount - l.movingFrameCount;
          const explosionDuration = explosionFrameCount * l.speed;
          return l.delay + movingDuration + explosionDuration;
        }
        return l.delay + l.frameCount * l.speed;
      }),
      0
    );
  }, [finalLayers]);

  // ✅ Chạy animation (1 vòng hoặc lặp)
  useEffect(() => {
    if (!isPlaying && !isLooping) return;

    startTime.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime.current;
      const cycleTime = elapsed % totalDuration;

      // Khi không lặp → dừng sau 1 chu kỳ và reset
      if (!isLooping && elapsed >= totalDuration) {
        setIsPlaying(false);
        setIndices(getInitialIndices());
        setTranslateX(0);
        setStopPositions(finalLayers.map(() => null));
        cancelAnimationFrame(frameReq.current);
        return;
      }

      // Reset translateX và stopPositions khi bắt đầu chu kỳ mới trong chế độ lặp
      if (isLooping && cycleTime < (elapsed % totalDuration)) {
        setTranslateX(0);
        setStopPositions(finalLayers.map(() => null));
      }

      // Cập nhật frame và vị trí cho từng layer
      const newIndices = finalLayers.map((layer) => {
        if (cycleTime < layer.delay) return null;
        let frameElapsed = cycleTime - layer.delay;

        if (layer.moving && layer.moveStopDistance && layer.movingFrameCount) {
          const moveSpeed = 300; // pixels per second
          const movingDuration = (layer.moveStopDistance / moveSpeed) * 1000;
          const movingSpeed = movingDuration / layer.movingFrameCount;

          if (frameElapsed < movingDuration) {
            // Giai đoạn di chuyển với movingSpeed
            return Math.floor(frameElapsed / movingSpeed);
          } else {
            // Giai đoạn explosion với original speed
            const explosionElapsed = frameElapsed - movingDuration;
            const explosionProgress = explosionElapsed / layer.speed;
            return layer.movingFrameCount + Math.floor(explosionProgress);
          }
        } else {
          // Trường hợp thông thường
          const frameProgress = Math.min(
            frameElapsed / layer.speed,
            layer.frameCount - 1
          );
          return Math.floor(frameProgress);
        }
      });

      // Cập nhật vị trí ngang cho các layer có moving = true
      const hasMovingLayer = finalLayers.some((layer) => layer.moving);
      if (hasMovingLayer) {
        const moveSpeed = 300; // pixels per second
        const moveDistance = (cycleTime / 1000) * moveSpeed;

        // Cập nhật stopPositions cho các layer có stopMovingAtFrame hoặc moveStopDistance
        const newStopPositions = finalLayers.map((layer, i) => {
          if (!layer.moving) return stopPositions[i];

          // Kiểm tra moveStopDistance
          if (layer.moveStopDistance && moveDistance >= layer.moveStopDistance) {
            return stopPositions[i] !== null
              ? stopPositions[i]
              : layer.moveStopDistance;
          }

          // Kiểm tra stopMovingAtFrame
          if (layer.stopMovingAtFrame) {
            const currentFrame = newIndices[i];
            if (
              currentFrame !== null &&
              currentFrame >= layer.stopMovingAtFrame - 1
            ) {
              const stopTime =
                layer.delay + (layer.stopMovingAtFrame - 1) * layer.speed;
              return stopPositions[i] !== null
                ? stopPositions[i]
                : (stopTime / 1000) * moveSpeed;
            }
          }

          return stopPositions[i];
        });
        setStopPositions(newStopPositions);
        setTranslateX(moveDistance);
      }

      setIndices(newIndices);
      frameReq.current = requestAnimationFrame(tick);
    };

    frameReq.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameReq.current);
  }, [isPlaying, isLooping, totalDuration, finalLayers, resetCount]);

  // ✅ Chạy 1 lần (reset nếu đang chạy)
  const handlePlayOnce = () => {
    cancelAnimationFrame(frameReq.current);
    setIsLooping(false);
    setIndices(getInitialIndices());
    setTranslateX(0);
    setStopPositions(finalLayers.map(() => null));
    startTime.current = performance.now();
    setResetCount((c) => c + 1);
    setIsPlaying(true);
  };

  // ✅ Bật / tắt loop
  const handleToggleLoop = () => {
    if (isLooping) {
      setIsLooping(false);
      cancelAnimationFrame(frameReq.current);
      setIndices(getInitialIndices());
      setTranslateX(0);
      setStopPositions(finalLayers.map(() => null));
    } else {
      cancelAnimationFrame(frameReq.current);
      setIndices(getInitialIndices());
      setTranslateX(0);
      setStopPositions(finalLayers.map(() => null));
      startTime.current = performance.now();
      setIsLooping(true);
    }
  };

  // Expose handlePlayOnce and handleToggleLoop via ref
  useImperativeHandle(ref, () => ({
    handlePlayOnce,
    handleToggleLoop,
  }));

  return (
    <div className="flex flex-col items-center gap-3 mb-4">
      <div
        className="relative border border-gray-400 rounded-md"
        style={{ width: finalWidth, height: finalHeight, overflow: "visible" }}
      >
        {finalLayers.map((layer, i) => {
          const index = indices[i];
          const frameList = allFrames[i];
          if (index === null || !frameList[index]) return null;

          // Tính toán translateX cho layer nếu moving = true
          const layerTranslateX = layer.moving
            ? stopPositions[i] !== null
              ? (layer.flip ? stopPositions[i] : -stopPositions[i])
              : layer.flip
                ? translateX
                : -translateX
            : 0;

          return (
            <img
              key={layer.name || i}
              src={frameList[index]}
              alt={`${layer.name}-frame-${index}`}
              className="absolute top-0 left-0"
              style={{
                width: finalWidth,
                height: finalHeight,
                objectFit: "none",
                transform: layer.flip
                  ? `translateX(${layerTranslateX}px) scaleX(-1)`
                  : `translateX(${layerTranslateX}px)`,
                zIndex: layer.name === "slash" ? 20 : 10,
              }}
            />
          );
        })}
      </div>

      {/* <div className="flex gap-2">
        <button
          onClick={handlePlayOnce}
          className="px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-600"
        >
          ▶ Bắt đầu
        </button>

        <button
          onClick={handleToggleLoop}
          className={`px-3 py-1 rounded text-white ${
            isLooping
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isLooping ? "⏹ Dừng lặp" : "🔁 Lặp"}
        </button>
      </div> */}
    </div>
  );
});

export default MultiSpriteAnimation;