import React from "react";
import "./AdminSettings.css"; // hoặc file riêng nếu muốn

const AllowedTypesSelector = ({ title, allTypes, selectedTypes, onToggle }) => {
  return (
    <div className="section">
      <h3>{title}</h3>
      <div className="toggle-group">
        {allTypes.map((type) => (
          <button
            key={type}
            className={`toggle-button ${selectedTypes.includes(type) ? "selected" : ""}`}
            onClick={() => onToggle(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllowedTypesSelector;
