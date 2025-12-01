import React, { useState, useRef, useEffect } from "react";
import "./two-column-reorder.css";
import Hr from "./Hr";

/**
 * TwoColumnReorder
 * - boxes: array of React nodes (7 boxes)
 * - editMode + setEditMode: được truyền từ ngoài vào (BattleGame → Header)
 *
 * Tất cả logic drag & drop giữ nguyên 100%, chỉ bỏ thanh reorder-bar đi
 */

export default function TwoColumnReorder({ editMode, boxes }) {
  const [leftOrder, setLeftOrder] = useState([0, 1, 2, 3, 4]);
  const [rightOrder, setRightOrder] = useState([5, 6]);

  // dragging info (source)
  const dragSource = useRef({ col: null, index: null, id: null });

  // preview orders while dragging
  const [previewLeft, setPreviewLeft] = useState(null);
  const [previewRight, setPreviewRight] = useState(null);

  // refs để đo vị trí con
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const leftChildrenRefs = useRef([]);
  const rightChildrenRefs = useRef([]);

  const setLeftChildRef = (el, i) => {
    leftChildrenRefs.current[i] = el;
  };
  const setRightChildRef = (el, i) => {
    rightChildrenRefs.current[i] = el;
  };

  const currentLeft = previewLeft ?? leftOrder;
  const currentRight = previewRight ?? rightOrder;

  // ==================== DRAG HANDLERS ====================

  const handleDragStart = (col, index) => (e) => {
    if (!editMode) {
      e.preventDefault();
      return;
    }

    const id = col === "left" ? leftOrder[index] : rightOrder[index];
    dragSource.current = { col, index, id };

    // Custom ghost image đẹp
    const draggedElement = e.target.closest(".box-wrapper");
    if (!draggedElement) return;

    const ghost = draggedElement.cloneNode(true);
    ghost.style.cssText = `
      width: ${draggedElement.offsetWidth}px;
      opacity: 0.8;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      transform: rotate(5deg);
      pointer-events: none;
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 9999;
    `;

    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);

    setTimeout(() => {
      if (ghost?.parentNode) ghost.parentNode.removeChild(ghost);
    }, 0);

    // Firefox yêu cầu
    try {
      e.dataTransfer.setData("text/plain", String(id));
    } catch (err) {}
  };

  const handleColumnDragOver = (col) => (e) => {
    if (!editMode) return;
    e.preventDefault();

    const from = dragSource.current;
    if (!from || from.col === null) return;

    const targetRefs = col === "left" ? leftChildrenRefs.current : rightChildrenRefs.current;
    const targetOrder = col === "left" ? leftOrder : rightOrder;

    let insertIndex = targetRefs.length;

    if (targetRefs.length === 0) {
      insertIndex = 0;
    } else {
      for (let i = 0; i < targetRefs.length; i++) {
        const el = targetRefs[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const midpointY = rect.top + rect.height / 2;
        if (e.clientY < midpointY) {
          insertIndex = i;
          break;
        }
      }
    }

    const { left, right } = buildPreviewForInsert(col, insertIndex);
    setPreviewLeft(left);
    setPreviewRight(right);
  };

  const buildPreviewForInsert = (targetCol, targetIndex) => {
    let left = [...leftOrder];
    let right = [...rightOrder];

    const { col: srcCol, id } = dragSource.current;

    // Xóa khỏi cột nguồn
    if (srcCol === "left") {
      const pos = left.indexOf(id);
      if (pos !== -1) left.splice(pos, 1);
    } else if (srcCol === "right") {
      const pos = right.indexOf(id);
      if (pos !== -1) right.splice(pos, 1);
    }

    // Chèn vào cột đích
    if (targetCol === "left") {
      const safeIdx = Math.max(0, Math.min(targetIndex, left.length));
      left.splice(safeIdx, 0, id);
    } else {
      const safeIdx = Math.max(0, Math.min(targetIndex, right.length));
      right.splice(safeIdx, 0, id);
    }

    return { left, right };
  };

  const commitDrop = () => {
    if (!editMode) return;
    if (previewLeft !== null || previewRight !== null) {
      setLeftOrder(previewLeft ?? leftOrder);
      setRightOrder(previewRight ?? rightOrder);
    }

    // Reset trạng thái kéo
    dragSource.current = { col: null, index: null, id: null };
    setPreviewLeft(null);
    setPreviewRight(null);
  };

  const handleDragEnd = () => {
    commitDrop();
  };

  // ==================== RENDER COLUMN ====================

  const renderColumn = (order, colName) => (
    <div
      className="column"
      ref={colName === "left" ? leftColRef : rightColRef}
      onDragOver={handleColumnDragOver(colName)}
      onDrop={commitDrop}
    >
      {order.map((boxId, idx) => (
        <React.Fragment key={`frag-${colName}-${boxId}`}>
          <div
            key={`${colName}-${boxId}`}
            className={`box-wrapper ${editMode ? "edit-mode" : ""}`}
            draggable={editMode}
            onDragStart={handleDragStart(colName, idx)}
            onDragEnd={handleDragEnd}
            onDragEnter={handleColumnDragOver(colName)}
            ref={(el) => {
              if (colName === "left") setLeftChildRef(el, idx);
              else setRightChildRef(el, idx);
            }}
          >
            {boxes[boxId]}
          </div>

          {idx < order.length - 1 && <Hr />}
        </React.Fragment>
      ))}
    </div>
  );

  // ==================== RETURN ====================

  return (
    <div className="two-col-reorder-wrapper">
      {/* ĐÃ BỎ reorder-bar đi hoàn toàn */}

      <div className="two-cols">
        {renderColumn(currentLeft, "left")}

        {/* Separator trên mobile */}
        {currentRight.length > 0 && (
          <div className="mobile-column-separator">
            <Hr />
          </div>
        )}

        {renderColumn(currentRight, "right")}
      </div>
    </div>
  );
}