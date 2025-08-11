import React from "react";
import { useImportYugioh } from "./useImportYugioh";
import "../common/ImportData.css";
import { useTranslation } from "react-i18next";

const ImportDataYugioh = () => {
  const { t } = useTranslation();

  const {
    progress,
    status,
    loading,
    message,
    lastImportTime,
    lastUpdate,
    syncMessage,
    handleImport,
    repoName,
  } = useImportYugioh();

  const repoWarning =
    lastImportTime && lastUpdate && lastUpdate > lastImportTime;

  return (
    <div className="import-container">
      <button
        onClick={handleImport}
        disabled={loading}
        className={`import-button${loading ? " loading" : ""}`}
      >
        {loading ? t("importingData")+"..." : "📥 "+t("updateYugiohData")}
      </button>

      {lastImportTime && (
        <p className="last-import-time">
          🕒 {t("lastImport")}:{" "}
          <strong>{lastImportTime.toLocaleString()}</strong>
        </p>
      )}

      {lastUpdate && (
        <p className="repo-update-time">
          📦 <code>ygoprodeck.com</code> {t("lastImport")}:{" "}
          <strong>{lastUpdate.toLocaleString()}</strong>
        </p>
      )}

      {repoWarning && (
        <p className="repo-warning">
          ⚠️ {t("theDataHasBeenUpdated")} {t("youShouldUpdateTheDataAgain")}
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