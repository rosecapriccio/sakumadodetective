//import React from "react";
import styles from "./LogMenu.module.css";
import { CHARA_DB, type CharacterId } from "../data/characters";

interface LogEntry {
  name?: string;
  text: string;
}

function getCharacterIdByName(name: string): CharacterId | null {
  for (const [charId, charData] of Object.entries(CHARA_DB)) {
    if (charData.name === name) {
      return charId as CharacterId;
    }
  }
  return null;
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
          logList.map((log, index) => {
            const charId = log.name ? getCharacterIdByName(log.name) : null;

            return (
              <div
                key={index}
                className={`${styles.logItem} ${
                  log.text.startsWith("▶") ? styles.choiceLog : ""
                }`}
              >
                {log.name && (
                  <div
                    className={`${styles.nameTag} ${charId ? styles[charId] : ""}`}
                  >
                    {log.name}
                  </div>
                )}
                <div className={styles.messageText}>{log.text}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
