import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

export const useImportYugioh = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [lastImportTime, setLastImportTime] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");

  const connectionRef = useRef(null);
  const repoName = "db.ygoprodeck.com";

  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const res = await axios.get("/ImportLog/last/yugioh");
        if (res.data.lastImport) {
          setLastImportTime(new Date(res.data.lastImport));
        }
      } catch {}
    };

    const fetchDbVersion = async () => {
      try {
        const res = await axios.get(
          "https://db.ygoprodeck.com/api/v7/checkDBVer.php"
        );
        const data = Array.isArray(res.data) ? res.data[0] : undefined;
        if (data?.last_update) {
          setLastUpdate(new Date(data.last_update));
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
      setStatus(`📄 Đang xử lý file (${data.current}/${data.total})`);
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
      "Bạn có chắc muốn cập nhật toàn bộ dữ liệu Yu-Gi-Oh!?"
    );
    if (!confirmed) return;

    const now = new Date();
    setLoading(true);
    setMessage("");
    setProgress(0);
    setStatus("🔄 Đồng bộ dữ liệu...");

    try {
      const syncRes = await axios.post("/Sync/sync-yugioh");
      if (syncRes.data.message) {
        setSyncMessage(syncRes.data.message);
      }

      setStatus("📥 Đang gửi yêu cầu nhập dữ liệu...");
      const res = await axios.post("/Import/import-yugioh");
      setMessage(res.data.message);
      setLastImportTime(now);

      await axios.post("/ImportLog/log/yugioh", { time: now.toISOString() });
    } catch (err) {
      setMessage("❌ Lỗi khi gọi API import hoặc đồng bộ.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return {
    progress,
    status,
    loading,
    message,
    connected,
    lastImportTime,
    lastUpdate,
    syncMessage,
    handleImport,
    repoName,
  };
};
