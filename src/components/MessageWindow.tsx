//import React from "react";
import styles from "./MessageWindow.module.css";
import { CHARA_DB, type CharacterId } from "../data/characters";

interface Choice {
  label: string;
  nextScene: string;
}

interface MessageWindowProps {
  show: boolean;
  name: string;
  text: string;
  isTyping: boolean;
  choices?: Choice[];
  showChoices: boolean;
  onChoiceSelect: (choice: Choice) => void;
  readChoices: string[];
  currentChoiceKeyPrefix: string;
}

function getCharacterIdByName(name: string): CharacterId | null {
  for (const [charId, charData] of Object.entries(CHARA_DB)) {
    if (charData.name === name) {
      return charId as CharacterId;
    }
  }
  return null;
}

export default function MessageWindow({
  show,
  name,
  text,
  isTyping,
  choices,
  showChoices,
  onChoiceSelect,
  readChoices,
  currentChoiceKeyPrefix,
}: MessageWindowProps) {
  // 表示しない設定の時は、そもそも何も描画しない
  if (!show) return null;

  const charId = getCharacterIdByName(name);

  return (
    <div className={styles.container}>
      {name && (
        <div className={`${styles.nameTag} ${charId ? styles[charId] : ""}`}>
          {name}
        </div>
      )}

      <div className={styles.textArea}>
        {text}
        {!isTyping && text !== "" && <span className={styles.triangle}>▼</span>}
      </div>

      {/* 選択肢ボタン */}
      {choices && showChoices && (
        <div className={styles.choicesWrapper}>
          {/* MessageWindow.tsx 内のボタンループ部分 */}
          {choices.map((choice, index) => {
            const isRead = readChoices.includes(
              `${currentChoiceKeyPrefix}${choice.label}`,
            );

            return (
              <button
                key={index}
                className={styles.choiceBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onChoiceSelect(choice);
                }}
                style={{
                  color: isRead ? "#888" : "#fff",
                  borderColor: isRead ? "#444" : "#fff",
                }}
              >
                {isRead ? "✔ " : ""}
                {choice.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
