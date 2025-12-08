import React, { useState, useRef } from "react";
import "./two-column-reorder.css";
import Hr from "./Hr";

export default function TwoColumnReorder({ editMode, boxes }) {
  const [leftOrder, setLeftOrder] = useState([0, 1, 2, 3, 4]);
  const [rightOrder, setRightOrder] = useState([5, 6, 7]);

  // Tab hiện tại trên mobile
  const [activeTab, setActiveTab] = useState(0);

  const dragSource = useRef({ col: null, index: null, id: null });
  const [previewLeft, setPreviewLeft] = useState(null);
  const [previewRight, setPreviewRight] = useState(null);

  const currentLeft = previewLeft ?? leftOrder;
  const currentRight = previewRight ?? rightOrder;

  // Hard-code: mỗi tab chứa box nào
  const tabContents = [
    [0, 1, 2, 6, 5, 4, 7, 3],
    // [0, 2, 1, 7, 8, 3, 9], // Tab 1
    // [1, 4, 5, 6], // Tab 2
    // [0, 2],
    // [1, 3, 9],
  ];

  // Tìm box hiện tại nằm ở tab nào + vị trí trong tab
  const getBoxLocation = (boxId) => {
    for (let tabIdx = 0; tabIdx < tabContents.length; tabIdx++) {
      const idxInTab = tabContents[tabIdx].indexOf(boxId);
      if (idxInTab !== -1) {
        return { tabIdx, idxInTab };
      }
    }
    return null;
  };

  // ==================== DRAG HANDLERS ====================
  const handleDragStart = (col, index) => (e) => {
    if (!editMode) {
      e.preventDefault();
      return;
    }
    const id = col === "left" ? leftOrder[index] : rightOrder[index];
    dragSource.current = { col, index, id };

    const draggedEl = e.target.closest(".box-wrapper");
    if (!draggedEl) return;

    const ghost = draggedEl.cloneNode(true);
    ghost.style.cssText = `
      width:${draggedEl.offsetWidth}px;
      opacity:0.8; box-shadow:0 20px 40px rgba(0,0,0,0.3);
      transform:rotate(5deg); pointer-events:none;
      position:absolute; top:-1000px; left:-1000px; z-index:9999;
    `;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => ghost?.parentNode?.removeChild(ghost), 0);

    try {
      e.dataTransfer.setData("text/plain", String(id));
    } catch (_) {}
  };

  const handleColumnDragOver = (targetCol) => (e) => {
    if (!editMode) return;
    e.preventDefault();

    const { id } = dragSource.current;
    if (id === null) return;

    // Tính vị trí chèn trong cột đích
    let insertIndex =
      targetCol === "left" ? currentLeft.length : currentRight.length;

    // Nếu đang drag trên một box cụ thể → tính chính xác hơn (giữ logic cũ)
    const rect = e.currentTarget.getBoundingClientRect();
    const elements = e.currentTarget.querySelectorAll(".box-wrapper");
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const boxRect = el.getBoundingClientRect();
      if (e.clientY < boxRect.top + boxRect.height / 2) {
        insertIndex = i;
        break;
      }
    }

    const { left, right } = buildPreview(targetCol, insertIndex);
    setPreviewLeft(left);
    setPreviewRight(right);
  };

  const buildPreview = (targetCol, insertIdx) => {
    let newLeft = [...leftOrder];
    let newRight = [...rightOrder];
    const { col: srcCol, id } = dragSource.current;

    // Xóa khỏi nguồn
    if (srcCol === "left") newLeft = newLeft.filter((x) => x !== id);
    else newRight = newRight.filter((x) => x !== id);

    // Chèn vào đích
    if (targetCol === "left") {
      newLeft.splice(insertIdx, 0, id);
    } else {
      newRight.splice(insertIdx, 0, id);
    }
    return { left: newLeft, right: newRight };
  };

  const commitDrop = () => {
    if (!editMode) return;
    if (previewLeft || previewRight) {
      setLeftOrder(previewLeft ?? leftOrder);
      setRightOrder(previewRight ?? rightOrder);
    }
    dragSource.current = { col: null, index: null, id: null };
    setPreviewLeft(null);
    setPreviewRight(null);
  };

  // ==================== RENDER DESKTOP ====================
  const renderDesktop = () => (
    <>
      <Hr />

      <div className="two-cols">
        <div
          className="column"
          onDragOver={handleColumnDragOver("left")}
          onDrop={commitDrop}
        >
          {currentLeft.map((id, i) => (
            <React.Fragment key={`left-${id}`}>
              <div
                className={`box-wrapper ${editMode ? "edit-mode" : ""}`}
                draggable={editMode}
                onDragStart={handleDragStart("left", i)}
                onDragEnd={commitDrop}
              >
                {boxes[id]}
              </div>
              {i < currentLeft.length - 1 && <Hr />}
            </React.Fragment>
          ))}
        </div>

        <div
          className="column"
          onDragOver={handleColumnDragOver("right")}
          onDrop={commitDrop}
        >
          {currentRight.map((id, i) => (
            <React.Fragment key={`right-${id}`}>
              <div
                className={`box-wrapper ${editMode ? "edit-mode" : ""}`}
                draggable={editMode}
                onDragStart={handleDragStart("right", i)}
                onDragEnd={commitDrop}
              >
                {boxes[id]}
              </div>
              {i < currentRight.length - 1 && <Hr />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );

  // ==================== RENDER MOBILE (Bottom Tabs) ====================
  const renderMobile = () => {
    const currentTabBoxes = tabContents[activeTab] || [];

    return (
      <div className="mobile-bottom-tabs">
        {/* Nội dung tab */}
        <div className="mobile-tab-content">
          {currentTabBoxes.map((fixedId, idxInTab) => {
            // Tìm id thực tế đang ở vị trí này (do người dùng đã sắp xếp lại)
            const actualId =
              [...currentLeft, ...currentRight].find((id) =>
                tabContents.flat().indexOf(id) ===
                tabContents.flat().indexOf(fixedId)
                  ? false
                  : getBoxLocation(id)?.tabIdx === activeTab &&
                    getBoxLocation(id)?.idxInTab === idxInTab
              ) || fixedId; // fallback nếu không tìm thấy (an toàn)

            // Tìm đúng id đang ở vị trí này theo thứ tự hiện tại
            const allBoxes = [...currentLeft, ...currentRight];
            const currentBoxAtThisPos =
              allBoxes.find((id) => {
                const loc = getBoxLocation(id);
                return (
                  loc && loc.tabIdx === activeTab && loc.idxInTab === idxInTab
                );
              }) || fixedId;

            const isInLeft = currentLeft.includes(currentBoxAtThisPos);
            const col = isInLeft ? "left" : "right";
            const sourceIdx = isInLeft
              ? currentLeft.indexOf(currentBoxAtThisPos)
              : currentRight.indexOf(currentBoxAtThisPos);

            return (
              <React.Fragment key={`mobile-${currentBoxAtThisPos}`}>
                <div
                  className={`box-wrapper ${editMode ? "edit-mode" : ""}`}
                  draggable={editMode}
                  onDragStart={handleDragStart(col, sourceIdx)}
                  onDragEnd={commitDrop}
                >
                  {boxes[currentBoxAtThisPos]}
                </div>
                {idxInTab < currentTabBoxes.length - 1 && <Hr />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tab bar ở dưới cùng */}
        {/* <div className="mobile-tab-bar">
          {[
            // { id: 0, label: "", icon: "💡" },
            // { id: 1, label: "", icon: "⌛" },
            // { id: 2, label: "", icon: "⋯" },
            // Thêm tab mới ở đây nếu cần
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div> */}
      </div>
    );
  };

  return (
    <div className="two-col-reorder-wrapper">
      <div className="desktop-view">{renderDesktop()}</div>
      <div className="mobile-view">{renderMobile()}</div>
    </div>
  );
}
