import React, { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from "react";

const imageCache = new Map();

const SpriteSheetPlayerCore = forwardRef(({ characterData, defaultAction = "idle", flipped = false }, ref) => {
  const [currentAction, setCurrentAction] = useState(defaultAction);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imageStatus, setImageStatus] = useState({});
  const [isAttackLooping, setIsAttackLooping] = useState(false);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  const CANVAS_SIZE = 300;
  const VIEWPORT_SIZE = 100;

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

  // CĂN NHÂN VẬT: GIỮA X, ĐÁY Y
  const spriteX = (CANVAS_SIZE - frameWidth) / 2;
  const spriteY = CANVAS_SIZE - frameHeight;

  // KHUNG 100x100: GIỮA ĐÁY NHÂN VẬT
  const viewportX = (CANVAS_SIZE - VIEWPORT_SIZE) / 2;
  const viewportY = CANVAS_SIZE - VIEWPORT_SIZE + 10;

  const finalFlip = actionFlip !== false ? actionFlip : flipped;
  const isLooping = (currentAction === "idle" && !isAttackLooping) || 
                    (currentAction === "melee" && isAttackLooping);

  const img = useMemo(() => {
    if (!image) return null;
    if (imageCache.has(image)) {
      const cached = imageCache.get(image);
      if (cached.complete && cached.naturalWidth > 0) {
        setImageStatus(prev => ({ ...prev, [currentAction]: "loaded" }));
      } else if (cached.complete) {
        setImageStatus(prev => ({ ...prev, [currentAction]: "error" }));
      }
      return cached;
    }

    const imgObj = new Image();
    imgObj.src = image;
    setImageStatus(prev => ({ ...prev, [currentAction]: "loading" }));

    imgObj.onload = () => {
      imageCache.set(image, imgObj);
      setImageStatus(prev => ({ ...prev, [currentAction]: "loaded" }));
    };
    imgObj.onerror = () => {
      setImageStatus(prev => ({ ...prev, [currentAction]: "error" }));
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
  }, [isPlaying, currentAction, img, frameCount, speed, isLooping, isAttackLooping]);

  // VẼ CANVAS
  useEffect(() => {
    if (!canvasRef.current || !img || imageStatus[currentAction] !== "loaded") return;
    
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

    const destX = spriteX;
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
      Math.max(0, srcX), Math.max(0, srcY),
      drawWidth, drawHeight,
      destX, destY,
      drawWidth, drawHeight
    );

    ctx.restore();
  }, [currentFrame, currentAction, imageStatus, finalFlip, leftOffset, topOffset, frameWidth, frameHeight, horizontalSpacing, verticalSpacing, columns, spriteX, spriteY, img]);

  // API
  useImperativeHandle(ref, () => ({
    playAction: (action) => {
      if (characterData[action]) {
        setCurrentAction(action);
      }
    },
    toggleAutoAttack: () => {
      const newState = !isAttackLooping;
      setIsAttackLooping(newState);
      if (newState) {
        setCurrentAction("melee");
      } else {
        if (currentAction === "melee") {
          setCurrentAction("idle");
        }
      }
    },
    stopAutoAttack: () => {
      setIsAttackLooping(false);
      if (currentAction === "melee") {
        setCurrentAction("idle");
      }
    },
    getState: () => ({ action: currentAction, autoAttack: isAttackLooping })
  }), [currentAction, isAttackLooping, characterData]);

  return (
    <div className="relative w-[300px] h-[300px] flex justify-center items-end group">
      {/* KHUNG 100x100 - CHỈ CÓ BORDER, KHÔNG NỀN */}
      <div
        className="absolute w-[100px] h-[100px] border-1 border-white/90 rounded-2xl 
                   shadow-2xl group-hover:border-white group-hover:shadow-white/70 
                   transition-all duration-300 z-10 pointer-events-none"
        style={{
          left: `${viewportX}px`,
          top: `${viewportY}px`,
          background: "transparent", // BỎ NỀN
          backdropFilter: "none"     // BỎ BLUR
        }}
      />

      {/* CANVAS - NHÂN VẬT ĐÈ LÊN KHUNG */}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute inset-0 rounded-3xl overflow-visible
                   bg-transparent hover:shadow-white/50 transition-all duration-300
                   group-hover:scale-[1.02] cursor-pointer z-20"
        style={{ 
          imageRendering: "pixelated",
          background: "transparent",
        }}
      />

      {/* Action name */}
      {/* <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 
                      text-xs font-mono text-gray-200 bg-black/90 px-3 py-1 rounded-lg 
                      border border-white/30 backdrop-blur-sm z-30">
        {currentAction.toUpperCase()}
      </div> */}
    </div>
  );
});

SpriteSheetPlayerCore.displayName = 'SpriteSheetPlayerCore';
export default SpriteSheetPlayerCore;