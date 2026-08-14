import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHARA_DB } from "./data/characters";
//import { ITEM_DB } from "./data/items";
import type { Hotspot } from "./data/scenario";
import { scenario } from "./data/scenario";
import styles from "./NovelGame.module.css";

import TitleScreen from "./components/TitleScreen";
import MessageWindow from "./components/MessageWindow";
import ItemMenu from "./components/ItemMenu";
import LogMenu from "./components/LogMenu";

type ScreenState = "title" | "game" | "settings" | "ending";
type GameMode = "dialogue" | "investigation";
type InvestigationData = {
  type: "investigation";
  bg: string;
  hotspots: Hotspot[];
};

//Screen - Scene - Lineの単位
export default function NovelGame() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("title");
  const [hasSaveData, setHasSaveData] = useState(false);

  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentScene, setCurrentScene] =
    useState<keyof typeof scenario>("start");
  const [currentLine, setCurrentLine] = useState<number>(0);

  // ゲームモード（会話パート／探索パート）
  const [gameMode, setGameMode] = useState<GameMode>("dialogue");

  const [exploreDefinition, setExploreDefinition] =
    useState<InvestigationData>();

  const [showMessageWindow, setShowMessageWindow] = useState<boolean>(true); // 初期値はtrue（会話から始まるため）

  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  //テキスト全文 クリック時に全文表示するために保持しておく
  const [fullText, setFullText] = useState<string>("");

  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);

  const [readChoices, setReadChoices] = useState<string[]>([]);

  // 取得アイテム
  const [ownedItems, setOwnedItems] = useState<string[]>([]);

  // ログ履歴
  const [logList, setLogList] = useState<{ name?: string; text: string }[]>([]);

  // 背景とテキストデータの状態
  const [currentBg, setCurrentBg] = useState<string>("");
  const [isFading, setIsFading] = useState<boolean>(false);

  const sceneData = scenario[currentScene];
  const currentData = sceneData[currentLine];

  const triggerTyping = (text: string) => {
    if (typingTimer.current) clearInterval(typingTimer.current);

    setFullText(text);
    setDisplayedText("");
    setIsTyping(true);

    let currentText = "";
    let currentIndex = 0;
    const textArray = Array.from(text);

    typingTimer.current = setInterval(() => {
      if (currentIndex < textArray.length) {
        currentText += textArray[currentIndex];
        setDisplayedText(currentText);
        currentIndex++;
      } else {
        setIsTyping(false);
        if (typingTimer.current) clearInterval(typingTimer.current);
      }
    }, 50);
  };

  useEffect(() => {
    if (!currentData || currentScreen !== "game") return;

    if (currentData.type === "start_investigation") {
      const exploreSceneId = currentData.exploreScene;
      const exploreDef = scenario[exploreSceneId][0]; // scenario[exploreSceneId]

      if (exploreDef && exploreDef.type === "investigation") {
        setGameMode("investigation");
        setShowMessageWindow(false);
        setExploreDefinition(exploreDef);
        setCurrentBg(exploreDef.bg);
      } else {
        console.error("指定されたシーンは探索データではありませんでした");
      }

      setDisplayedText("");

      return;
    }

    if (currentData.type === "bg") {
      if (currentBg === currentData.bg) {
        setCurrentLine((prev) => prev + 1);
        return;
      }

      // 1. まず画面を真っ黒にする（フェードアウト開始）
      setIsFading(true);

      // 2. 0.5秒（500ミリ秒）待って、画面が真っ黒になった裏で背景画像を差し替える
      setTimeout(() => {
        setCurrentBg(currentData.bg);
        // 画面の黒幕を外す（フェードイン開始）
        setIsFading(false);

        // 3. さらに0.5秒待って、景色が完全に見えたら次の行へ進む
        setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
        }, 1000);
      }, 1000);
    } else if (currentData.type === "get_item") {
      // 既に持っていないかチェックして追加
      setOwnedItems((prev) => {
        if (prev.includes(currentData.itemId)) return prev; // 持ってたらそのまま
        return [...prev, currentData.itemId]; // 新規追加
      });

      // アイテムを手に入れたら、即座に次の行（「〇〇を手に入れた！」というテキスト等）へ進む
      setCurrentLine((prev) => prev + 1);
    }
  }, [currentLine, currentScene, currentScreen, currentData]);

  // キャラクター情報の取得
  let displayName = "";
  let displayImage = null;

  if (currentData && currentData.type === "text") {
    const characterInfo = currentData.charaId
      ? CHARA_DB[currentData.charaId]
      : null;
    displayName = characterInfo ? characterInfo.name : currentData.name || "";
    displayImage =
      characterInfo && currentData.face
        ? characterInfo.faces[currentData.face]
        : null;
  }

  // セーブデータの確認
  useEffect(() => {
    const savedDataString = localStorage.getItem("my_novel_autosave");
    if (savedDataString) {
      setHasSaveData(true);
    }
  }, []);

  // オートセーブ機能
  useEffect(() => {
    if (currentScreen !== "game") return;
    const saveData = {
      scene: currentScene,
      line: currentLine,
      bg: currentBg,
    };
    localStorage.setItem("my_novel_autosave", JSON.stringify(saveData));
  }, [currentScene, currentLine, currentScreen, currentBg]);

  const preloadedImages = useRef<HTMLImageElement[]>([]);

  // プリロード処理
  useEffect(() => {
    Object.values(CHARA_DB).forEach((chara) => {
      Object.values(chara.faces).forEach((imagePath) => {
        const img = new Image();
        img.src = `${imagePath}`;
        preloadedImages.current.push(img);
      });
    });
  }, []);

  useEffect(() => {
    if (
      currentScreen === "game" &&
      currentData?.type === "text" &&
      gameMode === "dialogue"
    ) {
      triggerTyping(currentData.text);
    }
  }, [currentLine, currentScene, currentScreen]);

  // 「最初から」遊ぶ時の処理
  const handleStartNewGame = () => {
    localStorage.removeItem("my_novel_autosave");
    setCurrentScene("start");
    setCurrentLine(0);
    setCurrentBg("");
    setDisplayedText("");
    setCurrentScreen("game");
  };

  // 「続きから」遊ぶ時の処理
  const handleContinueGame = () => {
    const savedDataString = localStorage.getItem("my_novel_autosave");
    if (savedDataString) {
      const saveData = JSON.parse(savedDataString);
      setCurrentScene(saveData.scene);
      setCurrentLine(saveData.line);
      setCurrentBg(saveData.bg || "");
      setDisplayedText("");
    }
    setCurrentScreen("game");
  };

  const handleNext = () => {
    if (isLogOpen || isItemMenuOpen) return;

    if (gameMode === "investigation") {
      if (!showMessageWindow) return;

      if (isTyping) {
        if (typingTimer.current) clearInterval(typingTimer.current);
        setDisplayedText(fullText);
        setIsTyping(false);
      } else {
        setShowMessageWindow(false);
        setDisplayedText("");
      }
      return;
    }

    if (!currentData || currentData.type !== "text") return; // bg処理中はクリック無効
    if (currentData.type === "text" && currentData.choices && !allChoicesRead) {
      //選択肢ある時はクリック無効ただし条件全てOKなら進む
      return;
    }
    if (isTyping) {
      // 文字が流れている途中にクリック：一気に全文字表示
      if (typingTimer.current) clearInterval(typingTimer.current);
      setDisplayedText(currentData.text || "");
      setIsTyping(false);
    } else {
      if (currentData.type === "text" && currentData.nextScene) {
        console.log("--- 既読判定デバッグ ---");
        console.log("現在のシーン:", currentScene);
        console.log("持っている既読リスト:", readChoices);
        // console.log(
        //   "今チェックすべきキー:",
        //   currentData.choices.map((c) => `${currentScene}-${c.label}`),
        // );
        console.log("判定結果:", allChoicesRead);

        const hasChoices = !!currentData.choices;
        if (!hasChoices || allChoicesRead) {
          setLogList((prev) => [
            ...prev,
            { name: displayName, text: currentData.text },
          ]);
          setCurrentScene(currentData.nextScene as keyof typeof scenario);
          setCurrentLine(0);
          setDisplayedText("");
          return;
        }
      }

      // 全文字出終わっている：次のセリフへ
      if (currentLine < sceneData.length - 1) {
        setLogList((prev) => [
          ...prev,
          { name: displayName, text: currentData.text || "" },
        ]);
        setDisplayedText("");
        setCurrentLine((prev) => prev + 1);
      }
    }
  };

  // 選択肢を選んだときの処理
  const handleChoice = (choice: { label: string; nextScene: string }) => {
    if (!currentData || currentData.type !== "text") return;

    const choiceKey = `${currentScene}-${choice.label}`;
    setReadChoices((prev) => {
      if (prev.includes(choiceKey)) return prev;
      return [...prev, choiceKey];
    });

    setLogList((prev) => [
      ...prev,
      { name: displayName, text: currentData.text || "" },
      { text: `▶ 【選択】${choice.label}` },
    ]);

    setDisplayedText("");
    setCurrentScene(choice.nextScene as keyof typeof scenario);
    setCurrentLine(0);
  };

  const currentReadCount = readChoices.filter((key) =>
    key.startsWith(`${currentScene}-`),
  ).length;

  const totalChoices =
    currentData.type === "text" && currentData.choices
      ? currentData.choices.length
      : 0;

  const allChoicesRead = totalChoices > 0 && currentReadCount >= totalChoices;

  const getDisplayText = () => {
    if (allChoicesRead && currentData.type === "text") {
      return "（よし、一通り話は聞けたな。次へ進もう。）";
    }
    return displayedText; // タイピング中の文字、または通常の文字
  };

  // 画面の振り分け
  if (currentScreen === "title") {
    return (
      <TitleScreen
        onStartNewGame={handleStartNewGame}
        onContinueGame={handleContinueGame}
        hasSaveData={hasSaveData}
      />
    );
  }

  if (currentScreen === "settings") {
    return (
      <div>
        <h1>設定画面</h1>
        <button onClick={() => setCurrentScreen("title")}>
          タイトルに戻る
        </button>
      </div>
    );
  }

  // もしデータが存在しない場合はエラーを防ぐため空っぽの画面を出して守る
  if (!currentData) return <div className={styles.errorScreen} />;

  return (
    <div
      className={styles.mainContainer}
      onClick={handleNext}
      style={{
        backgroundImage: currentBg ? `url(${currentBg})` : "none",
      }}
    >
      <AnimatePresence>
        <motion.div
          key={currentBg || "default-bg"}
          className={styles.fadeOverlay}
          initial={{ opacity: 1 }}
          animate={{ opacity: isFading ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {gameMode === "investigation" &&
        exploreDefinition &&
        exploreDefinition.hotspots.map((h: Hotspot) => (
          <div
            key={h.id}
            className={`${styles.hotspot} ${styles.debug}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMessageWindow(true);
              triggerTyping(h.text);
            }}
            style={{
              left: `${h.percentX - h.percentWidth / 2}%`,
              top: `${h.percentY - h.percentHeight / 2}%`,
              width: `${h.percentWidth}%`,
              height: `${h.percentHeight}%`,
            }}
          />
        ))}

      {/* 立ち絵 */}
      <AnimatePresence mode="wait">
        {displayImage && currentData.type !== "bg" && (
          <motion.img
            key={displayImage}
            src={displayImage}
            alt="character"
            className={styles.characterImage}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ x: "-50%" }}
          />
        )}
      </AnimatePresence>

      {/* 画像のカットイン */}
      {currentData.type === "text" && currentData.cutin && (
        <div className={styles.cutinContainer}>
          <img
            src={`${currentData.cutin}`}
            alt="cutin"
            className={styles.cutinImage}
          />
        </div>
      )}

      {/* メッセージウィンドウ */}
      {(currentData.type == "text" ||
        currentData.type == "start_investigation") && (
        <MessageWindow
          show={
            (currentData.type === "text" ||
              currentData.type === "start_investigation") &&
            showMessageWindow
          }
          name={displayName}
          text={getDisplayText()}
          isTyping={isTyping}
          choices={
            currentData.type === "text" ? currentData.choices : undefined
          }
          showChoices={
            currentData.type === "text" &&
            displayedText === currentData.text &&
            !allChoicesRead
          }
          onChoiceSelect={handleChoice}
          readChoices={readChoices}
          currentChoiceKeyPrefix={`${currentScene}-`}
        />
      )}

      {/* 上部ボタン */}
      {currentData.type !== "bg" && (
        <div className={styles.topButtonsContainer}>
          <button
            className={styles.topButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsLogOpen(true);
            }}
          >
            ログ
          </button>
          <button
            className={`${styles.topButton} ${styles.itemButton}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsItemMenuOpen(true);
            }}
          >
            証拠品
          </button>
        </div>
      )}

      {/* ログ画面 */}
      {isLogOpen && (
        <LogMenu logList={logList} onClose={() => setIsLogOpen(false)} />
      )}

      {/* 証拠品リスト画面 */}
      {isItemMenuOpen && (
        <ItemMenu
          ownedItems={ownedItems}
          onClose={() => setIsItemMenuOpen(false)}
        />
      )}
    </div>
  );
}
