// SpriteSheetPlayerCore.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";

const imageCache = new Map();

const SpriteSheetPlayerCore = forwardRef(
  (
    {
      characterData,
      defaultAction = "idle",
      flipped = false,
      distance,
      health = 1,
      characterName,
    },
    ref
  ) => {
    const [currentAction, setCurrentAction] = useState(defaultAction);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [imageStatus, setImageStatus] = useState({});
    const [isAttackLooping, setIsAttackLooping] = useState(false);
    const [translateX, setTranslateX] = useState(0);

    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);
    const moveAnimRef = useRef(null);

    const CANVAS_SIZE = 300;
    const FRAME_SIZE = 128;

    const config = characterData[currentAction] || {};
    const {
      image,
      frameCount = 1,
      columns = 1,
      leftOffset = 0,
      topOffset = 0,
      frameWidth = 64,
      frameHeight = 64,
      horizontalSpacing = 0,
      verticalSpacing = 0,
      speed = 100,
      flip: actionFlip = false,
    } = config;

    const baseSpriteX = (CANVAS_SIZE - frameWidth) / 2;
    const spriteY = CANVAS_SIZE - frameHeight - 20;

    const finalFlip = actionFlip !== false ? actionFlip : flipped;
    const isLooping =
      (currentAction === "idle" && !isAttackLooping) ||
      (currentAction === "melee" && isAttackLooping);

    // // MOVING LOGIC (distance)
    // useEffect(() => {
    //   if (!distance || distance <= 0) {
    //     setTranslateX(0);
    //     return;
    //   }
    //   const moveSpeed = 300;
    //   const start = performance.now();
    //   const tick = (now) => {
    //     const elapsed = (now - start) / 1000;
    //     const moveDistance = elapsed * moveSpeed;
    //     if (moveDistance >= distance) {
    //       setTranslateX(distance * (flipped ? 1 : -1));
    //       return;
    //     }
    //     setTranslateX(moveDistance * (flipped ? 1 : -1));
    //     moveAnimRef.current = requestAnimationFrame(tick);
    //   };
    //   moveAnimRef.current = requestAnimationFrame(tick);
    //   return () => cancelAnimationFrame(moveAnimRef.current);
    // }, [distance, flipped]);

    // DEATH & IDLE LOGIC
    useEffect(() => {
      if (health === 0 && characterData?.death) {
        setCurrentAction("death");
        setIsPlaying(true);
        setIsAttackLooping(false);
      } else if (health > 0) {
        // Hồi máu → về idle
        setCurrentAction("idle");
      }
    }, [health, characterData, currentAction]);

    // // 🔥 LOGIC MOVING THEO DISTANCE (nếu distance > 0)
    // useEffect(() => {
    //   if (!distance || distance <= 0) {
    //     setTranslateX(0);
    //     return;
    //   }

    //   const moveSpeed = 300; // px/s, giống SpriteAnimation
    //   const start = performance.now();
    //   const tick = (now) => {
    //     const elapsed = (now - start) / 1000; // seconds
    //     const moveDistance = elapsed * moveSpeed;
    //     if (moveDistance >= distance) {
    //       setTranslateX(distance * (flipped ? 1 : -1)); // Dừng ở distance, flip hướng
    //       return;
    //     }
    //     setTranslateX(moveDistance * (flipped ? 1 : -1)); // Di chuyển theo hướng flip
    //     moveAnimRef.current = requestAnimationFrame(tick);
    //   };
    //   moveAnimRef.current = requestAnimationFrame(tick);

    //   return () => cancelAnimationFrame(moveAnimRef.current);
    // }, [distance, flipped]);

    const img = useMemo(() => {
      if (!image) return null;
      if (imageCache.has(image)) {
        const cached = imageCache.get(image);
        if (cached.complete && cached.naturalWidth > 0) {
          setImageStatus((prev) => ({ ...prev, [currentAction]: "loaded" }));
        } else if (cached.complete) {
          setImageStatus((prev) => ({ ...prev, [currentAction]: "error" }));
        }
        return cached;
      }

      const imgObj = new Image();
      imgObj.src = image;
      setImageStatus((prev) => ({ ...prev, [currentAction]: "loading" }));

      imgObj.onload = () => {
        imageCache.set(image, imgObj);
        setImageStatus((prev) => ({ ...prev, [currentAction]: "loaded" }));
      };
      imgObj.onerror = () => {
        setImageStatus((prev) => ({ ...prev, [currentAction]: "error" }));
      };
      return imgObj;
    }, [image, currentAction]);

    // Animation trigger
    useEffect(() => {
      setCurrentFrame(0);
      setIsPlaying(true);
      if (currentAction === "death") {
        setIsAttackLooping(false);
      }
    }, [currentAction]);

    // Animation loop
    useEffect(() => {
      if (!img || imageStatus[currentAction] === "error" || !isPlaying) return;

      startTimeRef.current = performance.now();
      const tick = (now) => {
        const elapsed = now - startTimeRef.current;
        const totalDuration = frameCount * speed;

        if (isLooping) {
          const newFrame = Math.floor((elapsed % totalDuration) / speed);
          setCurrentFrame(newFrame);
          animationRef.current = requestAnimationFrame(tick);
        } else {
          if (elapsed >= totalDuration) {
            setIsPlaying(false);
            setCurrentFrame(frameCount - 1);
            if (currentAction === "death") return;
            if (isAttackLooping) {
              setCurrentAction("melee");
              setIsPlaying(true);
              startTimeRef.current = performance.now();
              animationRef.current = requestAnimationFrame(tick);
            } else {
              setCurrentAction("idle");
            }
            return;
          }
          const newFrame = Math.floor(elapsed / speed);
          setCurrentFrame(newFrame);
          animationRef.current = requestAnimationFrame(tick);
        }
      };
      animationRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animationRef.current);
    }, [
      isPlaying,
      currentAction,
      img,
      frameCount,
      speed,
      isLooping,
      isAttackLooping,
    ]);

    // 🔥 VẼ CANVAS - ÁP DỤNG TRANSLATEX CHO MOVING
    useEffect(() => {
      if (!canvasRef.current || !img || imageStatus[currentAction] !== "loaded")
        return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const col = currentFrame % columns;
      const row = Math.floor(currentFrame / columns);
      const srcX = col * (frameWidth + horizontalSpacing) + leftOffset;
      const srcY = row * (frameHeight + verticalSpacing) + topOffset;

      const drawWidth = Math.min(frameWidth, img.width - Math.max(0, srcX));
      const drawHeight = Math.min(frameHeight, img.height - Math.max(0, srcY));
      if (drawWidth <= 0 || drawHeight <= 0) return;

      const destX = baseSpriteX + translateX;
      const destY = spriteY;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      if (finalFlip) {
        ctx.translate(destX + drawWidth / 2, destY + drawHeight / 2);
        ctx.scale(-1, 1);
        ctx.translate(-(destX + drawWidth / 2), -(destY + drawHeight / 2));
      }

      ctx.drawImage(
        img,
        Math.max(0, srcX),
        Math.max(0, srcY),
        drawWidth,
        drawHeight,
        destX,
        destY,
        drawWidth,
        drawHeight
      );
      ctx.restore();
    }, [
      currentFrame,
      currentAction,
      imageStatus,
      finalFlip,
      leftOffset,
      topOffset,
      frameWidth,
      frameHeight,
      horizontalSpacing,
      verticalSpacing,
      columns,
      baseSpriteX,
      spriteY,
      img,
      translateX,
    ]);

    // API
    useImperativeHandle(
      ref,
      () => ({
        playAction: (action) =>
          characterData[action] && setCurrentAction(action),
        toggleAutoAttack: () => {
          const newState = !isAttackLooping;
          setIsAttackLooping(newState);
          if (newState) setCurrentAction("melee");
          else if (currentAction === "melee") setCurrentAction("idle");
        },
        stopAutoAttack: () => {
          setIsAttackLooping(false);
          if (currentAction === "melee") setCurrentAction("idle");
        },
        getState: () => ({
          action: currentAction,
          autoAttack: isAttackLooping,
        }),
        // THÊM: getElement() → trả về container
        getElement: () => containerRef.current,
      }),
      [currentAction, isAttackLooping, characterData]
    );

    // THÊM ref cho container
    const containerRef = useRef(null);

    return (
      <div
        ref={containerRef}
        className="relative border border-gray-400 rounded-md"
        style={{
          width: FRAME_SIZE,
          height: FRAME_SIZE,
          position: "relative",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            transform: "translateX(-50%)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0"
            style={{ imageRendering: "pixelated", background: "transparent" }}
          />
        </div>
      </div>
    );
  }
);

SpriteSheetPlayerCore.displayName = "SpriteSheetPlayerCore";
export default SpriteSheetPlayerCore;
