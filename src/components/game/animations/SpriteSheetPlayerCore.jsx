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
  ({ characterData, defaultAction = "idle", flipped = false }, ref) => {
    const [currentAction, setCurrentAction] = useState(defaultAction);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [imageStatus, setImageStatus] = useState({});
    const [isAttackLooping, setIsAttackLooping] = useState(false);

    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const startTimeRef = useRef(null);

    // 🔥 KÍCH THƯỚC CỐ ĐỊNH
    const CANVAS_SIZE = 300; // Canvas lớn → nhân vật TO
    const FRAME_SIZE = 128; // Khung hiển thị (giống SpriteAnimation)

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

    // 🔥 CĂN GIỮA NHÂN VẬT TRONG CANVAS 300x300
    const spriteX = (CANVAS_SIZE - frameWidth) / 2; // Giữa theo X
    const spriteY = CANVAS_SIZE - frameHeight - 20; // Đáy, hơi nâng lên

    const finalFlip = actionFlip !== false ? actionFlip : flipped;
    const isLooping =
      (currentAction === "idle" && !isAttackLooping) ||
      (currentAction === "melee" && isAttackLooping);

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

    // 🔥 VẼ CANVAS - GIỮ NGUYÊN LOGIC
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
      spriteX,
      spriteY,
      img,
    ]);

    // API - GIỮ NGUYÊN
    useImperativeHandle(
      ref,
      () => ({
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
        getState: () => ({
          action: currentAction,
          autoAttack: isAttackLooping,
        }),
      }),
      [currentAction, isAttackLooping, characterData]
    );

    return (
      <div
        className="relative border border-gray-400 rounded-md" // Giữ border
        style={{
          width: FRAME_SIZE, // 128
          height: FRAME_SIZE, // 128
          position: "relative",
          // 🔥 BỎ overflow: "hidden" → TRÀN RA!
          overflow: "visible", // ← CHÌA KHÓA!
        }}
      >
        {/* 🔥 CANVAS LỚN - CĂN ĐỂ TRÀN */}
        <div
          style={{
            position: "absolute",
            bottom: 0, // ← Đẩy canvas xuống dưới → chân trong khung, thân tràn lên
            left: "50%",
            width: CANVAS_SIZE, // 300
            height: CANVAS_SIZE, // 300
            transform: "translateX(-50%)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0"
            style={{
              imageRendering: "pixelated",
              background: "transparent",
            }}
          />
        </div>
      </div>
    );
  }
);

SpriteSheetPlayerCore.displayName = "SpriteSheetPlayerCore";
export default SpriteSheetPlayerCore;
