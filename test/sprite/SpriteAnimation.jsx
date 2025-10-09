import React, { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { ANIMATION_CONFIGS } from "./animationConstants";

/**
 * MultiSpriteAnimation
 * - Nhiều layer sprite song song
 * - Hỗ trợ ref để cha đo vị trí (getBoundingClientRect)
 */
const MultiSpriteAnimation = forwardRef(
  (
    {
      name,
      layers = [],
      pad = 3,
      ext = "png",
      width = 128,
      height = 128,
      distance,
      ...rest
    },
    ref
  ) => {
    const config = name && ANIMATION_CONFIGS[name] ? ANIMATION_CONFIGS[name] : {};
    const finalLayers = config.layers || layers;
    const finalWidth = config.width || width;
    const finalHeight = config.height || height;

    const getInitialIndices = () =>
      finalLayers.map((layer) => (layer.delay > 0 ? null : 0));

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [resetCount, setResetCount] = useState(0);
    const [indices, setIndices] = useState(getInitialIndices());
    const [translateX, setTranslateX] = useState(0);
    const [stopPositions, setStopPositions] = useState(
      finalLayers.map(() => null)
    );

    const frameReq = useRef(null);
    const startTime = useRef(0);

    // ✅ ref chính để cha có thể đo vị trí
    const containerRef = useRef(null);

    // ✅ expose functions và ref DOM cho component cha
    useImperativeHandle(ref, () => ({
      handlePlayOnce,
      handleToggleLoop,
      getElement: () => containerRef.current, // cho phép lấy DOM element
    }));

    // ✅ Tạo danh sách frame
    const allFrames = useMemo(() => {
      return finalLayers.map((layer) =>
        Array.from({ length: layer.frameCount }, (_, j) => {
          const num = j.toString().padStart(pad, "0");
          return `${layer.folder}frame${num}.${ext}`;
        })
      );
    }, [finalLayers, pad, ext]);

    // ✅ Tính toán totalDuration (sử dụng distance thay cho moveStopDistance)
    const totalDuration = useMemo(() => {
      return Math.max(
        ...finalLayers.map((layer) => {
          if (layer.moving && distance && layer.movingFrameCount) {
            const moveSpeed = 300;
            const movingDuration = (distance / moveSpeed) * 1000;
            const movingSpeed = movingDuration / layer.movingFrameCount;
            const explosionFrameCount = layer.frameCount - layer.movingFrameCount;
            const explosionDuration = explosionFrameCount * layer.speed;
            return layer.delay + movingDuration + explosionDuration;
          }
          return layer.delay + layer.frameCount * layer.speed;
        }),
        0
      );
    }, [finalLayers, distance]);

    // ✅ Animation loop
    useEffect(() => {
      if (!isPlaying && !isLooping) return;

      startTime.current = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime.current;
        const cycleTime = elapsed % totalDuration;

        if (!isLooping && elapsed >= totalDuration) {
          setIsPlaying(false);
          setIndices(getInitialIndices());
          setTranslateX(0);
          setStopPositions(finalLayers.map(() => null));
          cancelAnimationFrame(frameReq.current);
          return;
        }

        const newIndices = finalLayers.map((layer) => {
          if (cycleTime < layer.delay) return null;
          let frameElapsed = cycleTime - layer.delay;

          if (layer.moving && distance && layer.movingFrameCount) {
            const moveSpeed = 300;
            const movingDuration = (distance / moveSpeed) * 1000;
            const movingSpeed = movingDuration / layer.movingFrameCount;

            if (frameElapsed < movingDuration) {
              return Math.floor(frameElapsed / movingSpeed);
            } else {
              const explosionElapsed = frameElapsed - movingDuration;
              const explosionProgress = explosionElapsed / layer.speed;
              return (
                layer.movingFrameCount + Math.floor(explosionProgress)
              );
            }
          } else {
            const frameProgress = Math.min(
              frameElapsed / layer.speed,
              layer.frameCount - 1
            );
            return Math.floor(frameProgress);
          }
        });

        const hasMovingLayer = finalLayers.some((layer) => layer.moving);
        if (hasMovingLayer) {
          const moveSpeed = 300;
          const moveDistance = (cycleTime / 1000) * moveSpeed;

          const newStopPositions = finalLayers.map((layer, i) => {
            if (!layer.moving) return stopPositions[i];
            if (distance && moveDistance >= distance)
              return distance;
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
    }, [isPlaying, isLooping, totalDuration, finalLayers, distance, resetCount]);

    // ✅ Functions exposed to parent
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

    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center gap-3 mb-4"
      >
        <div
          className="relative border border-gray-400 rounded-md"
          style={{ width: finalWidth, height: finalHeight, overflow: "visible" }}
        >
          {finalLayers.map((layer, i) => {
            const index = indices[i];
            const frameList = allFrames[i];
            if (index === null || !frameList[index]) return null;

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
      </div>
    );
  }
);

export default MultiSpriteAnimation;