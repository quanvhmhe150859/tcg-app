// ImportData.jsx (đã sửa: đảm bảo chỉ tạo kết nối SignalR 1 lần)
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

  const connectionRef = useRef(null);

  useEffect(() => {
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

    // ✅ Chỉ start nếu chưa Connected hoặc Connecting
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      connection
        .start()
        .then(() => {
          console.log("✅ SignalR connected");
          setConnected(true);
        })
        .catch((err) => {
          console.error("SignalR start error:", err);
        });
    }

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  const handleImport = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn nhập toàn bộ dữ liệu từ file JSON?"
    );
    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setProgress(0);
    setStatus("Đang gửi yêu cầu tới server...");

    try {
      const res = await axios.post("/Import/import-json");
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi gọi API import.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <button
        onClick={handleImport}
        disabled={!connected || loading}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        {loading ? "Đang nhập dữ liệu..." : "📥 Nhập dữ liệu từ JSON"}
      </button>

      {loading && (
        <div style={{ marginTop: "1rem", width: "100%", maxWidth: "400px" }}>
          <div
            style={{
              height: "10px",
              backgroundColor: "#ccc",
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#4caf50",
                transition: "width 0.3s ease",
              }}
            ></div>
          </div>
          <p style={{ marginTop: "8px" }}>{status}</p>
        </div>
      )}

      {message && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
};

export default ImportData;
