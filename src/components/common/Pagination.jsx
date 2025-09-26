import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Pagination({ page, totalPages, setPage, isLoading }) {
  const { t } = useTranslation();

  const [showInput, setShowInput] = useState({ start: false, end: false });
  const [inputPage, setInputPage] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Chỉ cho phép nhập số
    setInputPage(value);
  };

  const handleInputSubmit = (position) => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
    setInputPage("");
    setShowInput({ ...showInput, [position]: false });
  };

  const handleEllipsisClick = (position) => {
    setShowInput({ ...showInput, [position]: true });
  };

  return (
    <div className="flex justify-center items-center gap-1 flex-wrap">
      <button
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        disabled={page <= 1 || isLoading}
        onClick={() => setPage(page - 1)}
      >
        {t("prev")}
      </button>

      {/* Trang đầu */}
      <button
        className={`px-3 py-1 rounded ${page === 1 ? "selected-tab" : ""}`}
        disabled={isLoading}
        onClick={() => setPage(1)}
      >
        1
      </button>

      {/* Dấu ... nếu cách xa trang đầu */}
      {page > 3 &&
        (showInput.start ? (
          <input
            type="text"
            value={inputPage}
            onChange={handleInputChange}
            onBlur={() => handleInputSubmit("start")}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInputSubmit("start");
            }}
            className="w-12 border p-1 rounded text-center"
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
            placeholder="Page"
            autoFocus
            disabled={isLoading}
          />
        ) : (
          <span
            className={`px-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-blue-500"}`}
            onClick={() => !isLoading && handleEllipsisClick("start")}
          >
            ...
          </span>
        ))}

      {/* Các trang quanh trang hiện tại */}
      {/* {Array.from({ length: 5 }, (_, i) => page - 2 + i) */}
      {Array.from({ length: 3 }, (_, i) => page - 1 + i)
        .filter((p) => p > 1 && p < totalPages)
        .map((p) => (
          <button
            key={p}
            className={`px-3 py-1 rounded ${p === page ? "selected-tab" : ""}`}
            disabled={isLoading}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}

      {/* Dấu ... nếu cách xa trang cuối */}
      {page < totalPages - 2 &&
        (showInput.end ? (
          <input
            type="text"
            value={inputPage}
            onChange={handleInputChange}
            onBlur={() => handleInputSubmit("end")}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInputSubmit("end");
            }}
            className="w-12 border p-1 rounded text-center"
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
            placeholder="Page"
            autoFocus
            disabled={isLoading}
          />
        ) : (
          <span
            className={`px-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-blue-500"}`}
            onClick={() => !isLoading && handleEllipsisClick("end")}
          >
            ...
          </span>
        ))}

      {/* Trang cuối */}
      {totalPages > 1 && (
        <button
          className={`px-3 py-1 rounded ${
            page === totalPages ? "selected-tab" : ""
          }`}
          disabled={isLoading}
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </button>
      )}

      <button
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        disabled={page >= totalPages || isLoading}
        onClick={() => setPage(page + 1)}
      >
        {t("next")}
      </button>
    </div>
  );
}