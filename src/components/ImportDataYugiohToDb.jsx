import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api2";

export default function ImportDataYugiohToDb() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastImport, setLastImport] = useState(null);
  const [dbVer, setDbVer] = useState(null);
  const [isOutdated, setIsOutdated] = useState(false);

  const fetchLastImportTime = async () => {
    try {
      const res = await apiFetch("/ImportLog/last/yugioh");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLastImport(data.lastImport);
      return data.lastImport;
    } catch {
      setLastImport(null);
      return null;
    }
  };

  const fetchDbVersion = async (importTime) => {
    try {
      const res = await fetch("https://db.ygoprodeck.com/api/v7/checkDBVer.php");
      const json = await res.json();
      const versionText = json[0]?.last_update;
      setDbVer(versionText);

      const dbDate = new Date(versionText);
      const importDate = new Date(importTime);

      if (importTime && dbDate > importDate) {
        setIsOutdated(true);
      } else {
        setIsOutdated(false);
      }
    } catch {
      setDbVer(null);
    }
  };

  const handleSyncAndImport = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Bước 1: Đồng bộ dữ liệu (sync)
      const syncRes = await apiFetch("/sync-yugioh", { method: "POST" });
      if (!syncRes.ok) {
        const text = await syncRes.text();
        throw new Error(`Lỗi đồng bộ: ${text}`);
      }

      // Bước 2: Import dữ liệu
      const importRes = await apiFetch("/import-yugioh", { method: "POST" });
      if (!importRes.ok) {
        const text = await importRes.text();
        throw new Error(`Lỗi import: ${text}`);
      }

      const data = await importRes.json();
      setMessage(data.message);

      const updatedImportTime = await fetchLastImportTime();
      await fetchDbVersion(updatedImportTime);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastImportTime().then((importTime) => {
      fetchDbVersion(importTime);
    });
  }, []);

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>🃏 Đồng bộ & Import Yu-Gi-Oh!</h3>

      <button onClick={handleSyncAndImport} disabled={loading}>
        {loading ? "⏳ Đang xử lý..." : "🔄 Đồng bộ & Import"}
      </button>

      {message && (
        <div style={{ marginTop: "0.5rem", color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: "0.5rem", fontStyle: "italic", color: "#555" }}>
        🕒 Lần import gần nhất: {lastImport || "Chưa có"}
        <br />
        🧩 Dữ liệu chính thức mới nhất: {dbVer || "Không xác định"}
      </div>

      {isOutdated && (
        <div style={{ color: "orange", marginTop: "0.5rem" }}>
          ⚠️ Dữ liệu đã cũ! Vui lòng import lại để cập nhật thẻ mới.
        </div>
      )}
    </div>
  );
}
