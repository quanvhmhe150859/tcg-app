import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ANIMATION_CONFIGS } from "../constants/animationConstants";

const SpriteAnimation = forwardRef(
  (
    {
      name,
      layers = [],
      pad = 3,
      ext = "png",
      width = 128,
      height = 128,
      distance,
      health,
      flip,
      ...rest
    },
    ref
  ) => {
    const [randomName, setRandomName] = useState(null);
    const fadeDuration = 100; // ms

    // 🟢 Khi mount hoặc name="random" => chọn sprite ngẫu nhiên ngay
    useEffect(() => {
      if (name === "random" && !randomName) {
        const keys = Object.keys(ANIMATION_CONFIGS);
        if (keys.length > 0) {
          const newName = keys[Math.floor(Math.random() * keys.length)];
          setRandomName(newName);
        }
      }
    }, [name, randomName]);

    // 🟥 Khi chết (health = 0) => đợi fade-out rồi đổi sprite khác
    useEffect(() => {
      if (name === "random" && health === 0) {
        const timeout = setTimeout(() => {
          const keys = Object.keys(ANIMATION_CONFIGS);
          if (keys.length > 0) {
            const newName = keys[Math.floor(Math.random() * keys.length)];
            setRandomName(newName);
            console.log("new enemy sprites");
          }
        }, fadeDuration + 100);
        return () => clearTimeout(timeout);
      }
    }, [health, name]);

    // 🔸 Reset randomName nếu không dùng "random"
    useEffect(() => {
      if (name !== "random") setRandomName(null);
    }, [name]);

    const spriteName = name === "random" ? randomName : name;

    // ----------------------------
    // 🔹 Config + layers
    // ----------------------------
    const config =
      spriteName && ANIMATION_CONFIGS[spriteName]
        ? ANIMATION_CONFIGS[spriteName]
        : {};
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
    const [opacity, setOpacity] = useState(1);

    const frameReq = useRef(null);
    const startTime = useRef(null);
    const containerRef = useRef(null);

    // Khi đổi sprite ngẫu nhiên => reset frame về ban đầu
    useEffect(() => {
      setIndices(getInitialIndices());
    }, [spriteName]);

    useImperativeHandle(ref, () => ({
      handlePlayOnce,
      handleToggleLoop,
      getElement: () => containerRef.current,
    }));

    // ----------------------------
    // 🔹 Frame list
    // ----------------------------
    const allFrames = useMemo(() => {
      return finalLayers.map((layer) =>
        Array.from({ length: layer.frameCount }, (_, j) => {
          const num = j.toString().padStart(pad, "0");
          return `${layer.folder}frame${num}.${ext}`;
        })
      );
    }, [finalLayers, pad, ext]);

    // ----------------------------
    // 🔹 Fade-out khi chết
    // ----------------------------
    useEffect(() => {
      if (health === 0) {
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / fadeDuration, 1);
          setOpacity(1 - progress);
          if (progress < 1) {
            frameReq.current = requestAnimationFrame(tick);
          }
        };
        frameReq.current = requestAnimationFrame(tick);
      } else {
        setOpacity(1);
      }
    }, [health]);

    // ----------------------------
    // 🔹 Animation loop
    // ----------------------------
    const totalDuration = useMemo(() => {
      return Math.max(
        ...finalLayers.map((layer) => {
          if (layer.moving && distance && layer.movingFrameCount) {
            const moveSpeed = 300;
            const movingDuration = (distance / moveSpeed) * 1000;
            const movingSpeed = movingDuration / layer.movingFrameCount;
            const explosionFrameCount =
              layer.frameCount - layer.movingFrameCount;
            const explosionDuration = explosionFrameCount * layer.speed;
            return layer.delay + movingDuration + explosionDuration;
          }
          return layer.delay + layer.frameCount * layer.speed;
        }),
        0
      );
    }, [finalLayers, distance]);

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
              return layer.movingFrameCount + Math.floor(explosionProgress);
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
            if (distance && moveDistance >= distance) return distance;
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
    }, [
      isPlaying,
      isLooping,
      totalDuration,
      finalLayers,
      distance,
      resetCount,
    ]);

    // ----------------------------
    // 🔹 Controls
    // ----------------------------
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

    // ----------------------------
    // 🔹 Render
    // ----------------------------
    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center gap-3"
        style={{ opacity, transition: `opacity ${fadeDuration}ms ease` }}
      >
        <div
          className="relative border border-gray-400 rounded-md"
          style={{
            width: finalWidth,
            height: finalHeight,
            overflow: "visible",
          }}
        >
          {finalLayers.map((layer, i) => {
            const index = indices[i];
            const frameList = allFrames[i];
            if (index === null || !frameList[index]) return null;

            const layerTranslateX = layer.moving
              ? stopPositions[i] !== null
                ? flip
                  ? stopPositions[i]
                  : -stopPositions[i]
                : flip
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
                  transform: (flip ? layer.flip : !layer.flip)
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

export default SpriteAnimation;
