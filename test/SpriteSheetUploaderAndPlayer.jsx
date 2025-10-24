import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

const SpriteSheetUploaderAndPlayer = forwardRef((props, ref) => {
  const [spriteSheetUrl, setSpriteSheetUrl] = useState(null); // URL của sprite sheet
  const [frameCount, setFrameCount] = useState(5); // Số frame
  const [frameWidth, setFrameWidth] = useState(128); // Chiều rộng frame
  const [frameHeight, setFrameHeight] = useState(128); // Chiều cao frame
  const [horizontalSpacing, setHorizontalSpacing] = useState(0); // Khoảng cách ngang giữa các frame
  const [verticalSpacing, setVerticalSpacing] = useState(0); // Khoảng cách dọc giữa các frame
  const [leftOffset, setLeftOffset] = useState(0); // Offset bên trái
  const [topOffset, setTopOffset] = useState(0); // Offset bên trên
  const [columns, setColumns] = useState(5); // Số frame trên một hàng
  const [speed, setSpeed] = useState(120); // Tốc độ animation (ms/frame)
  const [delay, setDelay] = useState(0); // Delay trước khi bắt đầu
  const [flip, setFlip] = useState(false); // Flip sprite
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái chơi
  const [isLooping, setIsLooping] = useState(false); // Trạng thái loop
  const [index, setIndex] = useState(0); // Frame hiện tại
  const [loaded, setLoaded] = useState(false); // Sprite sheet đã load
  const [isDragging, setIsDragging] = useState(false); // Trạng thái kéo
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Vị trí chuột khi bắt đầu kéo

  const frameReq = useRef(null);
  const startTime = useRef(null);
  const containerRef = useRef(null);

  // Preload sprite sheet
  useEffect(() => {
    if (spriteSheetUrl) {
      const img = new Image();
      img.src = spriteSheetUrl;
      img.onload = () => setLoaded(true);
      img.onerror = () => console.warn("Failed to load sprite sheet");
      return () => URL.revokeObjectURL(spriteSheetUrl); // Giải phóng URL khi unmount
    }
  }, [spriteSheetUrl]);

  // Xử lý upload file
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      const url = URL.createObjectURL(file);
      setSpriteSheetUrl(url);
      setLoaded(false);
      setIndex(0);
    } else {
      alert("Vui lòng upload file PNG!");
    }
  };

  // Tính total duration
  const totalDuration = frameCount * speed + delay;

  // Animation loop
  useEffect(() => {
    if (!isPlaying && !isLooping) return;

    startTime.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime.current;
      let cycleTime = elapsed % totalDuration;

      if (!isLooping && elapsed >= totalDuration) {
        setIsPlaying(false);
        setIndex(0);
        cancelAnimationFrame(frameReq.current);
        return;
      }

      if (cycleTime < delay) {
        setIndex(0);
      } else {
        const frameElapsed = cycleTime - delay;
        const newIndex = Math.floor(frameElapsed / speed) % frameCount;
        setIndex(newIndex);
      }

      frameReq.current = requestAnimationFrame(tick);
    };

    frameReq.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameReq.current);
  }, [isPlaying, isLooping, totalDuration, delay, speed, frameCount]);

  // Controls
  const handlePlayOnce = () => {
    cancelAnimationFrame(frameReq.current);
    setIsLooping(false);
    setIndex(0);
    startTime.current = performance.now();
    setIsPlaying(true);
  };

  const handleToggleLoop = () => {
    cancelAnimationFrame(frameReq.current);
    if (isLooping) {
      setIsLooping(false);
      setIndex(0);
    } else {
      setIndex(0);
      startTime.current = performance.now();
      setIsLooping(true);
    }
  };

  // Xử lý kéo để chỉnh offset
  const handleMouseDown = (e) => {
    if (!loaded) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setLeftOffset((prev) => prev + deltaX);
    setTopOffset((prev) => prev + deltaY);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  useImperativeHandle(ref, () => ({
    handlePlayOnce,
    handleToggleLoop,
    getElement: () => containerRef.current,
  }));

  // Tính background position cho frame hiện tại, có tính khoảng cách
  const backgroundPositionX = -(index % columns) * (frameWidth + horizontalSpacing) + leftOffset;
  const backgroundPositionY = -Math.floor(index / columns) * (frameHeight + verticalSpacing) + topOffset;

  return (
    <div className="p-4 border border-gray-300 rounded-md max-w-3xl mx-auto">
      <h2 className="text-lg font-bold mb-4">Upload Sprite Sheet và Chạy Animation</h2>

      {/* Upload section */}
      <div className="mb-4">
        <label className="block mb-2">Upload Sprite Sheet (PNG):</label>
        <input
          type="file"
          accept="image/png"
          onChange={handleUpload}
          className="border p-1 w-full"
        />
      </div>

      {/* Cấu hình thông số */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Frame Count:</label>
          <input
            type="number"
            value={frameCount}
            onChange={(e) => setFrameCount(Math.max(1, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Frame Width (px):</label>
          <input
            type="number"
            value={frameWidth}
            onChange={(e) => setFrameWidth(Math.max(1, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Frame Height (px):</label>
          <input
            type="number"
            value={frameHeight}
            onChange={(e) => setFrameHeight(Math.max(1, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Horizontal Spacing (px):</label>
          <input
            type="number"
            value={horizontalSpacing}
            onChange={(e) => setHorizontalSpacing(Math.max(0, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Vertical Spacing (px):</label>
          <input
            type="number"
            value={verticalSpacing}
            onChange={(e) => setVerticalSpacing(Math.max(0, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Left Offset (px):</label>
          <input
            type="number"
            value={leftOffset}
            onChange={(e) => setLeftOffset(parseInt(e.target.value) || 0)}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Top Offset (px):</label>
          <input
            type="number"
            value={topOffset}
            onChange={(e) => setTopOffset(parseInt(e.target.value) || 0)}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Columns:</label>
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Speed (ms/frame):</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Math.max(1, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div>
          <label>Delay (ms):</label>
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(Math.max(0, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
        <div className="col-span-2">
          <label>
            <input
              type="checkbox"
              checked={flip}
              onChange={(e) => setFlip(e.target.checked)}
            />
            Flip Sprite (scaleX(-1))
          </label>
        </div>
      </div>

      {/* Buttons control */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handlePlayOnce}
          disabled={!loaded}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          Play Once
        </button>
        <button
          onClick={handleToggleLoop}
          disabled={!loaded}
          className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isLooping ? "Stop Loop" : "Loop"}
        </button>
      </div>

      {/* Display animation */}
      <div
        ref={containerRef}
        className="relative border border-gray-400 rounded-md mx-auto mb-4"
        style={{
          width: frameWidth,
          height: frameHeight,
          position: "relative",
          cursor: loaded ? "move" : "default",
        }}
        onMouseDown={handleMouseDown}
      >
        {loaded && spriteSheetUrl ? (
          <div
            className="absolute"
            style={{
              width: frameWidth,
              height: frameHeight,
              backgroundImage: `url(${spriteSheetUrl})`,
              backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
              backgroundRepeat: "no-repeat",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) ${flip ? "scaleX(-1)" : ""}`,
            }}
          />
        ) : (
          <p className="text-center">Upload sprite sheet để hiển thị</p>
        )}
      </div>
    </div>
  );
});

export default SpriteSheetUploaderAndPlayer;