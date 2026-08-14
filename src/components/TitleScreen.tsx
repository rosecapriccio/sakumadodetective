//import { useState } from "react";
import styles from "./TitleScreen.module.css";

interface TitleScreenProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  hasSaveData: boolean;
}

// const generateDust = (count: number) => {
//   return [...Array(count)].map((_, i) => ({
//     id: i,
//     bottom: `${Math.random() * 20}%`,
//     left: `${Math.random() * 100}%`,
//     size: `${Math.random() * 3 + 1}px`,
//     duration: `${Math.random() * 5 + 5}s`,
//     delay: `${Math.random() * -5}s`,
//   }));
// };

export default function TitleScreen({
  onStartNewGame,
  onContinueGame,
  hasSaveData,
}: TitleScreenProps) {
  //const [dusts] = useState(() => generateDust(12));

  return (
    <div className={styles.wrapper}>
      <div className={styles.fadeLayer}>
        <h1 className={styles.title}>Detective x Sakumado</h1>
        <div className={styles.buttonGroup}>
          <button onClick={onStartNewGame} className={styles.titleButton}>
            最初から
          </button>
          {hasSaveData && (
            <button onClick={onContinueGame} className={styles.titleButton}>
              続きから
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
