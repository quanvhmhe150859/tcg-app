import React, { useState, useEffect, useRef, useMemo } from "react";

const imageCache = new Map();

const SpriteSheetPlayerCore = ({ characterData, defaultAction = "idle", flipped = false }) => {
  const [currentAction, setCurrentAction] = useState(defaultAction);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imageStatus, setImageStatus] = useState({});
  const [isAttackLooping, setIsAttackLooping] = useState(false);
  const [pendingAttackLoop, setPendingAttackLoop] = useState(false);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  const { maxWidth, maxHeight } = useMemo(() => {
    let mw = 64, mh = 64;
    Object.values(characterData).forEach((action) => {
      if (action?.frameWidth > mw) mw = action.frameWidth;
      if (action?.frameHeight > mh) mh = action.frameHeight;
    });
    return { maxWidth: mw, maxHeight: mh };
  }, [characterData]);

  const config = characterData[currentAction] || {};
  const {
    image,
    frameCount = 1,
    columns = 1,
    leftOffset = 0,
    topOffset = 0,
    frameWidth = maxWidth,
    frameHeight = maxHeight,
    horizontalSpacing = 0,
    verticalSpacing = 0,
    speed = 100,
    flip: actionFlip = flipped,
  } = config;

  const offsetX = Math.floor((maxWidth - frameWidth) / 2);
  const offsetY = maxHeight - frameHeight;
  const isLooping = currentAction === "idle" || (currentAction === "melee" && isAttackLooping);

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

  useEffect(() => {
    setCurrentFrame(0);
    setIsPlaying(true);
    if (currentAction === "death") {
      setIsAttackLooping(false);
      setPendingAttackLoop(false);
    } else if (isAttackLooping && currentAction !== "melee") {
      setPendingAttackLoop(true);
    } else {
      setPendingAttackLoop(false);
    }
  }, [currentAction, isAttackLooping]);

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
          if (pendingAttackLoop) {
            setCurrentAction("melee");
            setIsAttackLooping(true);
            setPendingAttackLoop(false);
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
  }, [isPlaying, currentAction, img, frameCount, speed, isLooping, pendingAttackLoop, imageStatus]);

  useEffect(() => {
    if (!canvasRef.current || !img || imageStatus[currentAction] !== "loaded") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const col = currentFrame % columns;
    const row = Math.floor(currentFrame / columns);
    const srcX = col * (frameWidth + horizontalSpacing) + leftOffset;
    const srcY = row * (frameHeight + verticalSpacing) + topOffset;

    const drawWidth = Math.min(frameWidth, img.width - Math.max(0, srcX));
    const drawHeight = Math.min(frameHeight, img.height - Math.max(0, srcY));
    if (drawWidth <= 0 || drawHeight <= 0) return;

    const destX = offsetX + Math.max(0, -srcX);
    const destY = offsetY + Math.max(0, -srcY);

    ctx.save();
    if (actionFlip) {
      ctx.translate(destX + drawWidth / 2, destY + drawHeight / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(destX + drawWidth / 2), -(destY + drawHeight / 2));
    }
    ctx.drawImage(img, Math.max(0, srcX), Math.max(0, srcY), drawWidth, drawHeight, destX, destY, drawWidth, drawHeight);
    ctx.restore();
  }, [currentFrame, currentAction, imageStatus, actionFlip, leftOffset, topOffset, frameWidth, frameHeight, horizontalSpacing, verticalSpacing, columns, maxWidth, maxHeight, offsetX, offsetY, img]);

  const handleAttackLoop = () => {
    if (isAttackLooping) {
      setIsAttackLooping(false);
      setPendingAttackLoop(false);
      if (currentAction === "melee") setCurrentAction("idle");
    } else {
      setIsAttackLooping(true);
      setPendingAttackLoop(false);
      setCurrentAction("melee");
    }
  };

  const availableActions = Object.keys(characterData).filter(a => a !== "idle");

  return (
    <div className="p-6 border border-gray-300 rounded-lg max-w-2xl mx-auto bg-white shadow-md">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
        Animation Player
      </h3>

      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {availableActions.map(action => {
          const status = imageStatus[action];
          const isActive = currentAction === action;
          return (
            <button
              key={action}
              onClick={() => setCurrentAction(action)}
              disabled={isActive}
              className={`px-4 py-2 rounded font-medium text-sm transition
                ${isActive ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}
                ${status === "loading" && "bg-yellow-100 text-yellow-800 animate-pulse"}
                ${status === "error" && "bg-red-100 text-red-800"}
              `}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
              {status === "loading" && " Loading"}
              {status === "error" && " Failed"}
            </button>
          );
        })}

        <button
          onClick={handleAttackLoop}
          className={`px-4 py-2 rounded font-medium text-sm transition
            ${isAttackLooping ? "bg-red-600 text-white shadow-md" : "bg-orange-500 text-white hover:bg-orange-600"}
          `}
        >
          {isAttackLooping ? "Stop Attack" : "Attack Loop"}
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          width={maxWidth}
          height={maxHeight}
          className="border-2 border-dashed border-gray-400 rounded bg-gray-50"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="text-xs text-gray-600 text-center space-y-1">
        <div><strong>Action:</strong> {currentAction} | <strong>Frame:</strong> {currentFrame + 1}/{frameCount}</div>
        <div><strong>Status:</strong> {imageStatus[currentAction] === "loading" ? "Loading..." : imageStatus[currentAction] === "error" ? "Failed" : isLooping ? "Looping" : "Playing"}</div>
        <div><strong>Attack Loop:</strong> {isAttackLooping ? "ON" : "OFF"}</div>
      </div>
    </div>
  );
};

export default SpriteSheetPlayerCore;