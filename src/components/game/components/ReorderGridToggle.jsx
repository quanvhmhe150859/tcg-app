// ReorderGridToggle.jsx - iOS Style REORDER - FIXED & CLEAN
import { useState } from "react";

export default function ReorderGridToggle() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [items, setItems] = useState([
    { id: 1, label: "Box 1" },
    { id: 2, label: "Box 2" },
    { id: 3, label: "Box 3" },
    { id: 4, label: "Box 4" },
    { id: 5, label: "Box 5" },
    { id: 6, label: "Box 6" },
  ]);

  const [draggingIndex, setDraggingIndex] = useState(null);

  const handleDragStart = (e, index) => {
    if (!isEditMode) return;

    setDraggingIndex(index);

    // Tạo ghost bay theo con trỏ (đẹp như iOS)
    const ghost = e.target.cloneNode(true);
    ghost.classList.add("dragging-ghost");
    document.body.appendChild(ghost);

    // Đặt vị trí ghost theo chuột + offset đẹp
    e.dataTransfer.setDragImage(ghost, 60, 60);
  };

  const handleDragEnter = (index) => {
    if (draggingIndex === null || draggingIndex === index) return;

    setItems(prev => {
      const newItems = [...prev];
      const [moved] = newItems.splice(draggingIndex, 1);
      newItems.splice(index, 0, moved);
      setDraggingIndex(index);
      return newItems;
    });
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    // Xóa ghost
    document.querySelectorAll(".dragging-ghost").forEach(el => el.remove());
  };

  return (
    <>
      <div className="p-8 max-w-2xl mx-auto bg-gray-900 min-h-screen text-white">
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`mb-10 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 ${
            isEditMode 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          }`}
        >
          {isEditMode ? "Done" : "Rearrange"}
        </button>

        <div className="grid grid-cols-3 gap-6">
          {items.map((item, index) => {
            const isDragging = draggingIndex === index;

            return (
              <div
                key={item.id}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className={`
                  relative h-32 rounded-3xl overflow-hidden shadow-2xl
                  transition-all duration-300 ease-out will-change-transform
                  ${isDragging 
                    ? "opacity-0" 
                    : "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 cursor-grab active:cursor-grabbing hover:scale-105 hover:-translate-y-2"
                  }
                  ${isEditMode && !isDragging ? "ring-4 ring-white/20" : ""}
                `}
              >
                {/* Nội dung thật */}
                {!isDragging && (
                  <div className="flex items-center justify-center h-full font-bold text-2xl drop-shadow-2xl">
                    {item.label}
                  </div>
                )}

                {/* Khoảng trống khi đang kéo – chính ô này biến thành chỗ trống */}
                {isDragging && (
                  <div className="absolute inset-0 rounded-3xl bg-black/40 border-4 border-dashed border-cyan-400 backdrop-blur-sm animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ghost style - bay theo chuột */}
      <style>{`
        .dragging-ghost {
          position: fixed !important;
          top: -1000px;
          left: -1000px;
          pointer-events: pointer-events-none;
          z-index: 9999;
          width: 120px;
          height: 128px;
          border-radius: 24px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.6);
          transform: rotate(10deg) scale(1.1);
          opacity: 0.95;
        }
      `}</style>
    </>
  );
}