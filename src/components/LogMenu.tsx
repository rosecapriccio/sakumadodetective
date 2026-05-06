import React from "react";
import styles from "./LogMenu.module.css";

interface LogEntry {
  name?: string;
  text: string;
}

interface LogItemProps {
  logList: LogEntry[];
  onClose: () => void;
}

export default function LogItem({ logList, onClose }: LogItemProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button
          className={styles.closeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          閉じる
        </button>
      </div>

      <div className={styles.listContainer}>
        {logList.length === 0 ? (
          <div className={styles.emptyMsg}>ログはまだありません</div>
        ) : (
          logList.map((log, index) => (
            <div
              key={index}
              className={`${styles.logItem} ${
                log.text.startsWith("▶") ? styles.choiceLog : ""
              }`}
            >
              {log.name && <div className={styles.nameTag}>{log.name}</div>}
              <div className={styles.messageText}>{log.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
