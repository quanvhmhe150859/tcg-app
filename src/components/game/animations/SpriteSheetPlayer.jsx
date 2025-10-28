import React, { useState, useEffect, useRef } from "react";

const SpriteSheetPlayer = ({
  image, // URL hoặc dataURL
  frameCount = 1,
  columns = 1,
  leftOffset = 0,
  topOffset = 0,
  frameWidth = 64,
  frameHeight = 64,
  horizontalSpacing = 0,
  verticalSpacing = 0,
  speed = 100, // ms per frame
  flipped = false, // THÊM PROP: LẬT ẢNH
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
      setCurrentFrame(0);
    };
    img.onerror = () => {
      console.error("Failed to load sprite sheet image");
      setLoaded(false);
    };
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [image]);

  // Reset khi props thay đổi (bao gồm flipped)
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    frameCount, columns, leftOffset, topOffset, frameWidth, frameHeight,
    horizontalSpacing, verticalSpacing, speed, flipped // Theo dõi flipped
  ]);

  // Animation loop
  useEffect(() => {
    if (!loaded || (!isPlaying && !isLooping)) return;

    startTimeRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const totalDuration = frameCount * speed;
      const cycleTime = isLooping ? elapsed % totalDuration : Math.min(elapsed, totalDuration);

      const newFrame = Math.floor(cycleTime / speed);
      setCurrentFrame(newFrame);

      if (!isLooping && elapsed >= totalDuration) {
        setIsPlaying(false);
        setCurrentFrame(0);
        return;
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isLooping, loaded, frameCount, speed]);

  // Draw frame to canvas (với flipped)
  useEffect(() => {
    if (!loaded || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bắt đầu transform để lật
    ctx.save();

    if (flipped) {
      ctx.scale(-1, 1); // Lật ngang
      ctx.translate(-frameWidth, 0); // Đẩy về phải để lật đúng tâm
    }

    // Tính vị trí frame
    const col = currentFrame % columns;
    const row = Math.floor(currentFrame / columns);

    const srcX = col * (frameWidth + horizontalSpacing) + leftOffset;
    const srcY = row * (frameHeight + verticalSpacing) + topOffset;

    // Clip nếu ra ngoài
    const drawX = Math.max(0, -srcX);
    const drawY = Math.max(0, -srcY);
    const drawWidth = Math.min(frameWidth, img.width - Math.max(0, srcX));
    const drawHeight = Math.min(frameHeight, img.height - Math.max(0, srcY));

    if (drawWidth > 0 && drawHeight > 0) {
      ctx.drawImage(
        img,
        Math.max(0, srcX),
        Math.max(0, srcY),
        drawWidth,
        drawHeight,
        flipped ? drawX : drawX, // Nếu lật, drawX vẫn đúng vì đã scale
        drawY,
        drawWidth,
        drawHeight
      );
    }

    ctx.restore(); // Khôi phục context
  }, [
    currentFrame, loaded, leftOffset, topOffset, frameWidth, frameHeight,
    horizontalSpacing, verticalSpacing, columns, flipped // Theo dõi flipped
  ]);

  // Xử lý nút
  const handlePlayOnce = () => {
    setIsLooping(false);
    setIsPlaying(true);
    setCurrentFrame(0);
  };

  const handleLoop = () => {
    setIsPlaying(false);
    setIsLooping(true);
    setCurrentFrame(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsLooping(false);
    setCurrentFrame(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md max-w-md mx-auto bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-center">Sprite Animation Player</h3>

      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          width={frameWidth}
          height={frameHeight}
          className="border border-gray-400 rounded bg-gray-50"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handlePlayOnce}
          disabled={!loaded || isPlaying || isLooping}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Play Once
        </button>
        <button
          onClick={handleLoop}
          disabled={!loaded || isLooping}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLooping ? "Looping..." : "Loop"}
        </button>
        {(isPlaying || isLooping) && (
          <button
            onClick={handleStop}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
          >
            Stop
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-600 text-center">
        Frame: {currentFrame + 1}/{frameCount} |{" "}
        {isLooping ? "Looping" : isPlaying ? "Playing..." : "Stopped"} |{" "}
        {flipped ? "Flipped" : "Normal"}
      </div>
    </div>
  );
};

export default SpriteSheetPlayer;