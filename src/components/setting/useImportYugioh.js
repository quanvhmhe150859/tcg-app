import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getOrFetchAndSet } from "../../utils/cache";
import api from "../../utils/api";

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
    getOrFetchAndSet(
      "lastImportYugioh",
      () =>
        api.get("/api/ImportLog/last/yugioh").then((res) => res.data.lastImport),
      setLastImportTime,
      (x) => new Date(x)
    );

    getOrFetchAndSet(
      "lastUpdatedYugioh",
      () =>
        api
          .get("https://db.ygoprodeck.com/api/v7/checkDBVer.php")
          .then((res) => {
            const data = Array.isArray(res.data) ? res.data[0] : {};
            return data.last_update;
          }),
      setLastUpdate,
      (x) => new Date(x)
    );

    return () => {
      if (connectionRef.current) connectionRef.current.stop();
    };
  }, []);

  const handleImport = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn cập nhật toàn bộ dữ liệu Yu-Gi-Oh!?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    // Initialize SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/progressHub`, {
        withCredentials: true,
      })
      .configureLogging(signalR.LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    connection.on("ProgressUpdate", (data) => {
      const percent = Math.round((data.current / data.total) * 100);
      setProgress(percent);
      setStatus(`📄 Đang xử lý file (${data.current}/${data.total})`);
    });

    connectionRef.current = connection;

    try {
      await connection.start();
      setConnected(true);

      const now = new Date();
      setLoading(true);
      setMessage("");
      setProgress(0);
      setStatus("🔄 Đồng bộ dữ liệu...");

      const authHeader = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const syncRes = await api.post("/api/Sync/sync-yugioh", null, authHeader);
      if (syncRes.data.message) {
        setSyncMessage(syncRes.data.message);
      }

      setStatus("📥 Đang gửi yêu cầu nhập dữ liệu...");
      const res = await api.post("/api/Import/import-yugioh", null, authHeader);
      setMessage(res.data.message);
      setLastImportTime(now);

      await api.post(
        "/api/ImportLog/log/yugioh",
        { time: now.toISOString() },
        authHeader
      );
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi gọi API import hoặc đồng bộ.");
    } finally {
      setLoading(false);
      setStatus("");
      if (connectionRef.current) {
        connectionRef.current.stop();
        setConnected(false);
      }
      sessionStorage.removeItem("lastImportYugioh");
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