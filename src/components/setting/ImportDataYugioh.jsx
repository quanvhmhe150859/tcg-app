import React from "react";
import { useImportYugioh } from "./useImportYugioh";
import "../common/ImportData.css";

const ImportDataYugioh = () => {
  const {
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
  } = useImportYugioh();   // ✅ dùng hook mới

  const repoWarning =
    lastImportTime && lastUpdate && lastUpdate > lastImportTime;

  return (
    <div className="import-container">
      <button
        onClick={handleImport}
        disabled={!connected || loading}
        className={`import-button${loading ? " loading" : ""}`}
      >
        {loading ? "Đang nhập dữ liệu..." : "📥 Cập nhật dữ liệu Yu-Gi-Oh!"}
      </button>

      {lastImportTime && (
        <p className="last-import-time">
          🕒 Lần import gần nhất:{" "}
          <strong>{lastImportTime.toLocaleString()}</strong>
        </p>
      )}

      {lastUpdate && (
        <p className="repo-update-time">
          📦 <code>ygoprodeck.com</code> cập nhật gần nhất:{" "}
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

export default ImportDataYugioh;
