import React from "react";
import styles from "./MessageWindow.module.css";

// 親（NovelGame）から受け取るデータの型定義
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
  showChoices: boolean; // 選択肢を表示していいタイミングかどうか
  onChoiceSelect: (choice: Choice) => void;
  readChoices: string[];
  currentChoiceKeyPrefix: string;
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

  return (
    <div className={styles.container}>
      {/* 名前表示部分 */}
      {name && <div className={styles.nameTag}>{name}</div>}

      {/* テキストと逆三角形 */}
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
                  // 既読なら少し暗くしたり、色を変えたりする
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
