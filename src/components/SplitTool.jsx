import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL; // đổi cổng nếu backend khác

const SplitTool = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const startSplit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/split/split-json`, {
        method: "POST",
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("❌ Lỗi khi kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>✂️ Tách file JSON thành từng thẻ</h2>
      <button onClick={startSplit} disabled={loading}>
        {loading ? "Đang tách..." : "✅ Bắt đầu"}
      </button>

      {loading && <p>⏳ Đang xử lý...</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h4>🎉 Kết quả:</h4>
          <p>{result.message}</p>
          <p>Tổng thẻ: <b>{result.totalCards}</b></p>
          <p>Tổng file nguồn: <b>{result.totalFiles}</b></p>
          <p>Số file đã tạo: <b>{result.outputFiles.length}</b></p>
        </div>
      )}
    </div>
  );
};

export default SplitTool;
