import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getOrFetchAndSet } from "../../utils/cache";
import api from "../../utils/api";
import { useTranslation } from "react-i18next";

export const useImportPokemon = () => {
  const { t } = useTranslation();

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
    getOrFetchAndSet(
      "lastImportPokemon",
      () =>
        api.get("/api/ImportLog/last/pokemon").then((res) => res.data.lastImport),
      setLastImportTime,
      (x) => new Date(x)
    );

    getOrFetchAndSet(
      "lastUpdatedPokemon",
      () =>
        api
          .get(`https://api.github.com/repos/${repoName}`)
          .then((res) => res.data.pushed_at),
      setLastUpdate,
      (x) => new Date(x)
    );

    return () => {
      if (connectionRef.current) connectionRef.current.stop();
    };
  }, []);

  const handleImport = async () => {
    const confirmed = window.confirm(
      t("areYouSureYouWantToUpdatePokemonData")
    );
    if (!confirmed) return;

    const token = sessionStorage.getItem("jwt");
    if (!token) {
      alert(t("youAreNotLoggedIn"));
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
      setStatus(
        `📄 ${t("processingFile")} (${data.current}/${data.total})` //${data.file}
      );
    });

    connectionRef.current = connection;

    try {
      await connection.start();
      setConnected(true);

      const now = new Date();
      setLoading(true);
      setMessage("");
      setProgress(0);
      setStatus("🔄 "+t("dataSynchronization")+"...");

      const authHeader = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const syncRes = await api.post("/api/Sync/sync-pokemon", null, authHeader);
      if (syncRes.data.message) {
        setSyncMessage(syncRes.data.message);
      }

      setStatus("📥 "+t("sendingDataImportRequest")+"...");
      const res = await api.post("/api/Import/import-pokemon", null, authHeader);
      setMessage(res.data.message);
      setLastImportTime(now);

      await api.post(
        "/api/ImportLog/log/pokemon",
        { time: now.toISOString() },
        authHeader
      );
    } catch (err) {
      console.error(err);
      setMessage("❌ "+t("errorCallingImportOrSyncAPI"));
    } finally {
      setLoading(false);
      setStatus("");
      if (connectionRef.current) {
        connectionRef.current.stop();
        setConnected(false);
      }
      sessionStorage.removeItem("lastImportPokemon");
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