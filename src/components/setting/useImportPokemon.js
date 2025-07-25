import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

export const useImportPokemon = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [lastImportTime, setLastImportTime] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
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
          setLastUpdate(new Date(res.data.pushed_at));
        }
      } catch {}
    };

    fetchLastImport();
    fetchDbVersion();

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
      setStatus(`📄 Đang xử lý file ${data.file} (${data.current}/${data.total})`);
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
    const confirmed = window.confirm("Bạn có chắc muốn cập nhật toàn bộ dữ liệu Pokémon?");
    if (!confirmed) return;

    const now = new Date();
    setLoading(true);
    setMessage("");
    setProgress(0);
    setStatus("🔄 Đồng bộ dữ liệu...");

    try {
      const syncRes = await axios.post("/Sync/sync-pokemon");
      if (syncRes.data.message) {
        setSyncMessage(syncRes.data.message);
      }

      setStatus("📥 Đang gửi yêu cầu nhập dữ liệu...");
      const res = await axios.post("/Import/import-pokemon");
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
