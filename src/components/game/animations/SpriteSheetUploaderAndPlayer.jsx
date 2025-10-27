import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

const SpriteSheetUploaderAndPlayer = forwardRef((props, ref) => {
  useEffect(() => {
    document.body.style.minWidth = "640px";
    return () => {
      document.body.style.minWidth = ""; // reset khi rời trang
    };
  }, []);

  const [spriteSheetUrl, setSpriteSheetUrl] = useState(null);
  const [frameCount, setFrameCount] = useState(5);
  const [frameWidth, setFrameWidth] = useState(128);
  const [frameHeight, setFrameHeight] = useState(128);
  const [horizontalSpacing, setHorizontalSpacing] = useState(0);
  const [verticalSpacing, setVerticalSpacing] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);
  const [topOffset, setTopOffset] = useState(0);
  const [columns, setColumns] = useState(5);
  const [rows, setRows] = useState(1);
  const [speed, setSpeed] = useState(120);
  const [delay, setDelay] = useState(0);
  const [flip, setFlip] = useState(false);
  const [isVerticalFirst, setIsVerticalFirst] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isScaledDown, setIsScaledDown] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  const frameReq = useRef(null);
  const startTime = useRef(null);
  const containerRef = useRef(null);
  const originalImageRef = useRef(null);

  // Preload sprite sheet and get original dimensions
  useEffect(() => {
    if (spriteSheetUrl) {
      const img = new Image();
      img.src = spriteSheetUrl;
      img.onload = () => {
        setLoaded(true);
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.onerror = () => console.warn("Failed to load sprite sheet");
      return () => URL.revokeObjectURL(spriteSheetUrl);
    }
  }, [spriteSheetUrl]);

  // Handle file upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      const url = URL.createObjectURL(file);
      setSpriteSheetUrl(url);
      setLoaded(false);
      setIndex(0);
      setIsScaledDown(true);
    } else {
      alert("Please upload a PNG file!");
    }
  };

  // Calculate total duration
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

  // New handlers for Prev and Next buttons
  const handlePrevFrame = () => {
    cancelAnimationFrame(frameReq.current);
    setIsPlaying(false);
    setIsLooping(false);
    setIndex((prev) => (prev - 1 + frameCount) % frameCount);
  };

  const handleNextFrame = () => {
    cancelAnimationFrame(frameReq.current);
    setIsPlaying(false);
    setIsLooping(false);
    setIndex((prev) => (prev + 1) % frameCount);
  };

  // Handle drag for offset
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
    handleToggleLoop,
    handlePrevFrame,
    handleNextFrame,
    getElement: () => containerRef.current,
  }));

  // Calculate background position for current frame
  const calculateFramePosition = () => {
    if (isVerticalFirst) {
      const rowIndex = index % rows;
      const colIndex = Math.floor(index / rows);
      return {
        x: -(colIndex * (frameWidth + horizontalSpacing)) + leftOffset,
        y: -(rowIndex * (frameHeight + verticalSpacing)) + topOffset,
      };
    } else {
      const colIndex = index % columns;
      const rowIndex = Math.floor(index / columns);
      return {
        x: -(colIndex * (frameWidth + horizontalSpacing)) + leftOffset,
        y: -(rowIndex * (frameHeight + verticalSpacing)) + topOffset,
      };
    }
  };

  const { x: backgroundPositionX, y: backgroundPositionY } =
    calculateFramePosition();

  // Calculate display dimensions
  const displayWidth = isScaledDown
    ? originalDimensions.width * 0.25
    : originalDimensions.width;
  const displayHeight = isScaledDown
    ? originalDimensions.height * 0.25
    : originalDimensions.height;

  // Calculate highlight frame position (scaled to match display)
  const highlightScale = isScaledDown ? 0.25 : 1;
  const calculateHighlightPosition = () => {
    if (isVerticalFirst) {
      const rowIndex = index % rows;
      const colIndex = Math.floor(index / rows);
      return {
        x: colIndex * (frameWidth + horizontalSpacing) * highlightScale - leftOffset * highlightScale,
        y: rowIndex * (frameHeight + verticalSpacing) * highlightScale - topOffset * highlightScale,
      };
    } else {
      const colIndex = index % columns;
      const rowIndex = Math.floor(index / columns);
      return {
        x: colIndex * (frameWidth + horizontalSpacing) * highlightScale - leftOffset * highlightScale,
        y: rowIndex * (frameHeight + verticalSpacing) * highlightScale - topOffset * highlightScale,
      };
    }
  };

  const { x: highlightX, y: highlightY } = calculateHighlightPosition();

  // Toggle handlers
  const handleToggleDirection = () => {
    setIsVerticalFirst((prev) => !prev);
  };

  const handleToggleFlip = () => {
    setFlip((prev) => !prev);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md max-w-3xl mx-auto">
      <h2 className="text-lg font-bold mb-4">
        Upload Sprite Sheet and Play Animation
      </h2>

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

      {/* Grid for inputs (2 columns) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Column 1: Inputs */}
        <div>
          <label>Frame Count:</label>
          <input
            type="number"
            value={frameCount}
            onChange={(e) =>
              setFrameCount(Math.max(1, parseInt(e.target.value)))
            }
            className="border p-1 w-full"
          />
          <label className="block mt-2">Left Offset (px):</label>
          <input
            type="number"
            value={leftOffset}
            onChange={(e) => setLeftOffset(parseInt(e.target.value) || 0)}
            className="border p-1 w-full"
          />
          <label className="block mt-2">Frame Width (px):</label>
          <input
            type="number"
            value={frameWidth}
            onChange={(e) =>
              setFrameWidth(Math.max(1, parseInt(e.target.value)))
            }
            className="border p-1 w-full"
          />
          <label className="block mt-2">Horizontal Spacing (px):</label>
          <input
            type="number"
            value={horizontalSpacing}
            onChange={(e) =>
              setHorizontalSpacing(Math.max(0, parseInt(e.target.value)))
            }
            className="border p-1 w-full"
          />
          <label className="block mt-2">Speed (ms/frame):</label>
          <input
            type="number"
            value={speed}
            step={10}
            onChange={(e) => setSpeed(Math.max(1, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>

        {/* Column 2: Inputs */}
        <div>
          <label>{isVerticalFirst ? "Rows" : "Columns"}:</label>
          <input
            type="number"
            value={isVerticalFirst ? rows : columns}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value));
              if (isVerticalFirst) {
                setRows(value);
              } else {
                setColumns(value);
              }
            }}
            className="border p-1 w-full"
          />
          <label className="block mt-2">Top Offset (px):</label>
          <input
            type="number"
            value={topOffset}
            onChange={(e) => setTopOffset(parseInt(e.target.value) || 0)}
            className="border p-1 w-full"
          />
          <label className="block mt-2">Frame Height (px):</label>
          <input
            type="number"
            value={frameHeight}
            onChange={(e) =>
              setFrameHeight(Math.max(1, parseInt(e.target.value)))
            }
            className="border p-1 w-full"
          />
          <label className="block mt-2">Vertical Spacing (px):</label>
          <input
            type="number"
            value={verticalSpacing}
            onChange={(e) =>
              setVerticalSpacing(Math.max(0, parseInt(e.target.value)))
            }
            className="border p-1 w-full"
          />
          <label className="block mt-2">Delay (ms):</label>
          <input
            type="number"
            value={delay}
            step={100}
            onChange={(e) => setDelay(Math.max(0, parseInt(e.target.value)))}
            className="border p-1 w-full"
          />
        </div>
      </div>

      {/* Controls and Animation */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex gap-4 mb-2">
          <button
            onClick={handleToggleFlip}
            aria-pressed={flip}
          >
            {flip ? "Flipped ↪️🙃" : "Original ↩️🙂"}
          </button>
          <button
            onClick={handleToggleDirection}
            aria-pressed={isVerticalFirst}
          >
            {isVerticalFirst ? "Vertical ⬇️➡️" : "Horizontal ➡️⬇️"}
          </button>
        </div>
        <div className="flex gap-4 mb-4">
          <button
            onClick={handlePrevFrame}
            disabled={!loaded}
            className="disabled:opacity-50"
          >
            Prev ⏪
          </button>
          <button
            onClick={handleToggleLoop}
            disabled={!loaded}
            className="disabled:opacity-50"
          >
            {isLooping ? "Stop ⏹️" : "Loop ▶️"}
          </button>
          <button
            onClick={handleNextFrame}
            disabled={!loaded}
            className="disabled:opacity-50"
          >
            Next ⏩
          </button>
        </div>
        <div
          ref={containerRef}
          className="relative border border-gray-400 rounded-md overflow-visible"
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
            <p className="text-center">Upload sprite sheet to display</p>
          )}
        </div>
      </div>

      {/* Original image display */}
      {loaded && spriteSheetUrl && (
        <div className="mb-4 relative">
          <h3 className="text-md font-semibold mb-2">
            Original Sprite Sheet ({originalDimensions.width + " "}x
            {" " + originalDimensions.height})
          </h3>
          <div className="relative inline-block">
            <img
              ref={originalImageRef}
              src={spriteSheetUrl}
              alt="Original sprite sheet"
              style={{
                width: displayWidth,
                height: displayHeight,
                transition: "all 0.3s ease",
                maxWidth: "none",
              }}
            />
            <div
              className="absolute border-2 border-red-500"
              style={{
                width: frameWidth * highlightScale,
                height: frameHeight * highlightScale,
                left: highlightX,
                top: highlightY,
                pointerEvents: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default SpriteSheetUploaderAndPlayer;