import React, { useState, useRef, useEffect } from "react";
import "./two-column-reorder.css";
import Hr from "./Hr";

/**
 * TwoColumnReorder
 * - boxes: array of React nodes (7 boxes)
 *
 * Behavior:
 * - Two independent columns (leftOrder, rightOrder)
 * - Drag start: store source col/index/itemId
 * - Drag over column: compute dropIndex by comparing pointer position to each child's rect
 * - Render preview (placeholder) so UI shows where the item sẽ được chèn
 * - Drop (onDrop/onDragEnd): commit reorder
 *
 * Notes:
 * - Use onDragOver with e.preventDefault() on column to allow drop
 * - Use refs to measure each child bounding box to compute correct insertion point
 */

export default function TwoColumnReorder({ boxes }) {
  const [leftOrder, setLeftOrder] = useState([0, 1, 2]);
  const [rightOrder, setRightOrder] = useState([3, 4, 5, 6]);

  const [editMode, setEditMode] = useState(false);

  // dragging info (source)
  const dragSource = useRef({ col: null, index: null, id: null });

  // preview orders while dragging (do not commit until drop)
  const [previewLeft, setPreviewLeft] = useState(null);
  const [previewRight, setPreviewRight] = useState(null);

  // refs for columns and child wrappers to measure positions
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const leftChildrenRefs = useRef([]);
  const rightChildrenRefs = useRef([]);

  // reset children refs helper
  const setLeftChildRef = (el, i) => {
    leftChildrenRefs.current[i] = el;
  };
  const setRightChildRef = (el, i) => {
    rightChildrenRefs.current[i] = el;
  };

  // compute arrays to render: if preview exists use it else real order
  const currentLeft = previewLeft ?? leftOrder;
  const currentRight = previewRight ?? rightOrder;

  // helper to start dragging
  const handleDragStart = (col, index) => (e) => {
    if (!editMode) {
      e.preventDefault();
      return;
    }
    const id = col === "left" ? leftOrder[index] : rightOrder[index];
    dragSource.current = { col, index, id };
    // set dataTransfer to allow drag in Firefox
    try {
      e.dataTransfer.setData("text/plain", String(id));
    } catch {}
    // create ghost if desired (optional)
  };

  // called when pointer moves over a column (we compute insertion index)
  const handleColumnDragOver = (col) => (e) => {
    if (!editMode) return;
    e.preventDefault(); // necessary to allow drop

    const x = e.clientX;
    const y = e.clientY;

    const from = dragSource.current;
    if (!from || from.col === null) return;

    // pick target children refs and order
    const targetRefs =
      col === "left" ? leftChildrenRefs.current : rightChildrenRefs.current;
    const targetOrder = col === "left" ? leftOrder : rightOrder;

    // If there are no children, dropIndex = 0
    if (!targetRefs || targetRefs.length === 0) {
      // build preview arrays by removing source from source column and inserting into empty target at 0
      const { left: newLeft, right: newRight } = buildPreviewForInsert(col, 0);
      setPreviewLeft(newLeft);
      setPreviewRight(newRight);
      return;
    }

    // find index to insert by comparing pointer Y against child's midpoint
    let insertIndex = targetRefs.length; // default append at end
    for (let i = 0; i < targetRefs.length; i++) {
      const el = targetRefs[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const midpointY = rect.top + rect.height / 2;
      const midpointX = rect.left + rect.width / 2;
      // determine if layout is mostly vertical or horizontal in this column:
      // columns are vertical lists, use Y coordinate
      if (y < midpointY) {
        insertIndex = i;
        break;
      }
    }

    const { left: newLeft, right: newRight } = buildPreviewForInsert(
      col,
      insertIndex
    );
    setPreviewLeft(newLeft);
    setPreviewRight(newRight);
  };

  // helper: remove from source and insert into (col, index)
  const buildPreviewForInsert = (targetCol, targetIndex) => {
    // clone current real orders (not preview)
    let left = [...leftOrder];
    let right = [...rightOrder];

    // remove moving item from source
    const { col: srcCol, index: srcIndex, id } = dragSource.current;
    if (srcCol === "left") {
      // ensure valid index
      const pos = left.indexOf(id);
      if (pos !== -1) left.splice(pos, 1);
    } else if (srcCol === "right") {
      const pos = right.indexOf(id);
      if (pos !== -1) right.splice(pos, 1);
    }

    // insert into target
    if (targetCol === "left") {
      const safeIdx = Math.max(0, Math.min(targetIndex, left.length));
      left.splice(safeIdx, 0, id);
    } else {
      const safeIdx = Math.max(0, Math.min(targetIndex, right.length));
      right.splice(safeIdx, 0, id);
    }

    return { left, right };
  };

  // handle drop commit (onDrop on column or onDragEnd)
  const commitDrop = (col) => (e) => {
    if (!editMode) return;
    e.preventDefault();

    if (!dragSource.current || dragSource.current.col === null) return;

    // if preview exists, commit it; else nothing changed
    if (previewLeft !== null || previewRight !== null) {
      // commit preview (prefer previewLeft if set)
      setLeftOrder(previewLeft ?? leftOrder);
      setRightOrder(previewRight ?? rightOrder);
    }

    // clear dragging / preview
    dragSource.current = { col: null, index: null, id: null };
    setPreviewLeft(null);
    setPreviewRight(null);
  };

  // fallback commit on drag end
  const handleDragEnd = () => {
    // commit if preview exists
    if (previewLeft !== null || previewRight !== null) {
      setLeftOrder(previewLeft ?? leftOrder);
      setRightOrder(previewRight ?? rightOrder);
    }
    dragSource.current = { col: null, index: null, id: null };
    setPreviewLeft(null);
    setPreviewRight(null);
  };

  // render helper to attach refs for measurement
  const renderColumn = (order, colName) => (
    <div
      className="column"
      ref={colName === "left" ? leftColRef : rightColRef}
      onDragOver={handleColumnDragOver(colName)}
      onDrop={commitDrop(colName)}
    >
      {order.map((boxId, idx) => (
        <React.Fragment key={`frag-${colName}-${boxId}`}>
          <div
            key={`${colName}-${boxId}`}
            className={`box-wrapper ${editMode ? "edit-mode" : ""}`}
            draggable={editMode}
            onDragStart={handleDragStart(colName, idx)}
            onDragEnd={handleDragEnd}
            onDragEnter={(e) => handleColumnDragOver(colName)(e)}
            ref={(el) => {
              if (colName === "left") setLeftChildRef(el, idx);
              else setRightChildRef(el, idx);
            }}
          >
            {boxes[boxId]}
          </div>

          {/* Add Hr after each box except last */}
          {idx < order.length - 1 && <Hr />}
        </React.Fragment>
      ))}

      {/* Render invisible placeholder area at end so dropping to append works via onDragOver/onDrop */}
      <div className="column-end-spacer" />
    </div>
  );

  return (
    <div className="two-col-reorder-wrapper">
      <div className="reorder-bar">
        <button className="reorder-btn" onClick={() => setEditMode((v) => !v)}>
          {editMode ? "Done" : "Rearrange Layout"}
        </button>
        <div className="hint">Drag boxes to reorder across columns</div>
      </div>

      <div className="two-cols">
        {renderColumn(currentLeft, "left")}
        {renderColumn(currentRight, "right")}
      </div>
    </div>
  );
}
