import React, { useState, useCallback, useRef, useEffect } from "react";

const OptimizedComicImage = React.memo(({ url }) => (
  <img
    src={url}
    alt=""
    className="w-full block bg-black"
    loading="lazy"
    decoding="async"
  />
));

export default function ComicReader() {
  const [pages, setPages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const imageRefs = useRef(new Map());

  // Xóa tất cả ảnh
  const clearAllPages = useCallback(() => {
    // Giải phóng bộ nhớ
    pages.forEach(page => URL.revokeObjectURL(page.url));
    setPages([]);
    imageRefs.current.clear();
  }, [pages]);

  const processFiles = useCallback((fileList) => {
    const imageFiles = Array.from(fileList)
      .filter(f => f.type.startsWith("image/"))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const newPages = imageFiles.map(file => ({
      id: Date.now() + Math.random().toString(36),
      url: URL.createObjectURL(file),
    }));

    setPages(newPages);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      pages.forEach(page => URL.revokeObjectURL(page.url));
    };
  }, [pages]);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📖 Comic Reader</h1>
          
          {pages.length > 0 && (
            <button
              onClick={clearAllPages}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              🗑️ Clear All Images
            </button>
          )}
        </div>

        {pages.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`min-h-[580px] border-4 border-dashed flex flex-col items-center justify-center rounded-3xl transition-all ${
              isDragging ? "border-blue-500 bg-blue-950/30" : "border-gray-800"
            }`}
          >
            <p className="text-2xl mb-4">Drag and drop comic folder or multiple images here</p>
            <p className="text-gray-400 mb-8">Best supported on Chrome</p>

            <label className="px-10 py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl cursor-pointer text-lg">
              Choose Folder
              <input
                type="file"
                multiple
                webkitdirectory="true"
                directory="true"
                accept="image/*"
                onChange={(e) => processFiles(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-0">
            {pages.map((page, index) => (
              <div
                key={page.id}
                ref={el => imageRefs.current.set(index, el)}
                className="w-full border-b border-gray-900 last:border-none"
              >
                <OptimizedComicImage url={page.url} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}