import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import "./ImportData.css";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const ImportData = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [lastImportTime, setLastImportTime] = useState(null);
  const [lastUpdate, setlastUpdate] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");

  const connectionRef = useRef(null);
  const repoName = "PokemonTCG/pokemon-tcg-data";

  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const res = await axios.get("/ImportLog/last/pokemon");
        if (res.data.lastImport) {
          setLastImportTime(new Date(res.data.lastImport));
        }
      } catch {}
    };

    const fetchDbVersion = async () => {
      try {
        const res = await axios.get(`https://api.github.com/repos/${repoName}`);
        if (res.data.pushed_at) {
          setlastUpdate(new Date(res.data.pushed_at));
        }
      } catch {}
    };

    fetchLastImport();
    fetchDbVersion();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/progressHub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ProgressUpdate", (data) => {
      const percent = Math.round((data.current / data.total) * 100);
      setProgress(percent);
      setStatus(
        `📄 Đang xử lý file ${data.file} (${data.current}/${data.total})`
      );
    });

    connection
      .start()
      .then(() => setConnected(true))
      .catch((err) => console.error("SignalR start error:", err));

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) connectionRef.current.stop();
    };
  }, []);

  const handleImport = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn nhập toàn bộ dữ liệu từ file JSON?"
    );
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

      await axios.post("/ImportLog/log/pokemon", { time: now.toISOString() });
    } catch (err) {
      setMessage("❌ Lỗi khi gọi API import hoặc đồng bộ.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const repoWarning =
    lastImportTime && lastUpdate && lastUpdate > lastImportTime;

  return (
    <div className="import-container">
      <button
        onClick={handleImport}
        disabled={!connected || loading}
        className={`import-button${loading ? " loading" : ""}`}
      >
        {loading ? "Đang nhập dữ liệu..." : "📥 Cập nhật dữ liệu Pokémon"}
      </button>

      {lastImportTime && (
        <p className="last-import-time">
          🕒 Lần import gần nhất:{" "}
          <strong>{lastImportTime.toLocaleString()}</strong>
        </p>
      )}

      {lastUpdate && (
        <p className="repo-update-time">
          📦 Repo <code>{repoName}</code> cập nhật gần nhất:{" "}
          <strong>{lastUpdate.toLocaleString()}</strong>
        </p>
      )}

      {repoWarning && (
        <p className="repo-warning">
          ⚠️ Repo đã được cập nhật sau lần import. Bạn nên cập nhật lại dữ liệu.
        </p>
      )}

      {syncMessage && <p className="sync-message">{syncMessage}</p>}

      {loading && (
        <div className="progress-bar-container">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="import-status">{status}</p>
        </div>
      )}

      {message && <p className="import-message">{message}</p>}
    </div>
  );
};

export default ImportData;
