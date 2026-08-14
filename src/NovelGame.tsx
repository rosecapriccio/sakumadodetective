import { useNovelEngine } from "./hooks/useNovelEngine";
import styles from "./NovelGame.module.css";

import TitleScreen from "./components/TitleScreen";
import GameScreen from "./components/GameScreen";

//Screen - Scene - Lineの単位
export default function NovelGame() {
  const engine = useNovelEngine();

  // 画面の振り分け
  if (engine.currentScreen === "title") {
    return (
      <TitleScreen
        onStartNewGame={engine.handleStartNewGame}
        onContinueGame={engine.handleContinueGame}
        hasSaveData={engine.hasSaveData}
      />
    );
  }

  if (engine.currentScreen === "settings") {
    return (
      <div>
        <h1>設定画面</h1>
        <button onClick={() => engine.setCurrentScreen("title")}>
          タイトルに戻る
        </button>
      </div>
    );
  }

  // もしデータが存在しない場合はエラーを防ぐため空っぽの画面を出して守る
  if (!engine.currentData) return <div className={styles.errorScreen} />;

  return <GameScreen engine={engine} />;
}
