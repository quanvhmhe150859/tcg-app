import { useState } from "react";



export default function ImportDataYugioh() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://localhost:44391/Sync/sync-yugioh", {
        method: "POST"
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Lỗi không xác định");
      }

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>🃏 Import dữ liệu Yu-Gi-Oh!</h3>
      <button onClick={handleSync} disabled={loading}>
        {loading ? "⏳ Đang đồng bộ..." : "🔁 Đồng bộ Yu-Gi-Oh!"}
      </button>
      {message && (
        <div style={{ marginTop: "0.5rem", color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </div>
      )}
    </div>
  );
}
