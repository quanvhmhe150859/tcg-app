// ImportData.jsx (đã cập nhật: tự đồng bộ GitHub trước khi gọi import-json)
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const ImportData = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [lastImportTime, setLastImportTime] = useState(null);
  const [lastRepoUpdate, setLastRepoUpdate] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");

  const connectionRef = useRef(null);

  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const res = await axios.get("/ImportLog/last");
        if (res.data.lastImport) {
          setLastImportTime(new Date(res.data.lastImport));
        }
      } catch {}
    };

    const fetchGitHubUpdate = async () => {
      try {
        const res = await axios.get("https://api.github.com/repos/facebook/react");
        if (res.data.pushed_at) {
          setLastRepoUpdate(new Date(res.data.pushed_at));
        }
      } catch {}
    };

    fetchLastImport();
    fetchGitHubUpdate();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/progressHub`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connection.on("ProgressUpdate", (data) => {
      const percent = Math.round((data.current / data.total) * 100);
      setProgress(percent);
      setStatus(`📄 Đang xử lý file ${data.file} (${data.current}/${data.total})`);
    });

    connection.start()
      .then(() => setConnected(true))
      .catch((err) => console.error("SignalR start error:", err));

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) connectionRef.current.stop();
    };
  }, []);

  const handleImport = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn nhập toàn bộ dữ liệu từ file JSON?");
    if (!confirmed) return;

    const now = new Date();
    setLoading(true);
    setMessage("");
    setProgress(0);
    setStatus("🔄 Đồng bộ GitHub...");

    try {
      // Đồng bộ trước khi import
      const syncRes = await axios.post("/Sync/sync-github");
      if (syncRes.data.message) {
        setSyncMessage(syncRes.data.message);
      }

      setStatus("📥 Đang gửi yêu cầu nhập dữ liệu...");

      const res = await axios.post("/Import/import-json");
      setMessage(res.data.message);
      setLastImportTime(now);

      await axios.post("/ImportLog/log", { time: now.toISOString() });
    } catch (err) {
      setMessage("❌ Lỗi khi gọi API import hoặc đồng bộ.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const repoName = "facebook/react";
  const repoWarning = lastImportTime && lastRepoUpdate && lastRepoUpdate > lastImportTime;

  return (
    <div style={{ marginTop: "2rem" }}>
      <button onClick={handleImport} disabled={!connected || loading} style={{ padding: "10px 20px", fontSize: "16px" }}>
        {loading ? "Đang nhập dữ liệu..." : "📥 Nhập dữ liệu từ JSON"}
      </button>

      {lastImportTime && (
        <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
          🕒 Lần import gần nhất: <strong>{lastImportTime.toLocaleString()}</strong>
        </p>
      )}

      {lastRepoUpdate && (
        <p style={{ marginTop: "0.25rem" }}>
          📦 Repo <code>{repoName}</code> cập nhật gần nhất: <strong>{lastRepoUpdate.toLocaleString()}</strong>
        </p>
      )}

      {repoWarning && (
        <p style={{ color: "orange", marginTop: "0.5rem" }}>
          ⚠️ Repo đã được cập nhật sau lần import. Bạn nên cập nhật lại dữ liệu.
        </p>
      )}

      {syncMessage && <p style={{ marginTop: "1rem", color: "green", fontWeight: "bold" }}>{syncMessage}</p>}

      {loading && (
        <div style={{ marginTop: "1rem", width: "100%", maxWidth: "400px" }}>
          <div style={{ height: "10px", backgroundColor: "#ccc", borderRadius: "5px" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#4caf50",
                transition: "width 0.3s ease"
              }}
            ></div>
          </div>
          <p style={{ marginTop: "8px" }}>{status}</p>
        </div>
      )}

      {message && <p style={{ marginTop: "1rem", color: "green", fontWeight: "bold" }}>{message}</p>}
    </div>
  );
};

export default ImportData;
