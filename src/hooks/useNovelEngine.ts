import { useState, useEffect } from "react";
import { scenario } from "../data/scenario";
import { useTypewriter } from "./useTypewriter";
import { useSaveGame } from "./useSaveGame";
import { useCharacterDisplay } from "./useCharacterDisplay";
import { usePreloadImages } from "./usePreloadImages";
import { useInvestigationMode } from "./useInvestigationMode";

export type ScreenState = "title" | "game" | "settings" | "ending";
export type { GameMode, InvestigationData } from "./useInvestigationMode";

export function useNovelEngine() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("title");

  const [currentScene, setCurrentScene] =
    useState<keyof typeof scenario>("start");
  const [currentLine, setCurrentLine] = useState<number>(0);

  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);

  const [readChoices, setReadChoices] = useState<string[]>([]);

  // 取得アイテム
  const [ownedItems, setOwnedItems] = useState<string[]>([]);

  // ログ履歴
  const [logList, setLogList] = useState<{ name?: string; text: string }[]>([]);

  // 背景の状態
  const [currentBg, setCurrentBg] = useState<string>("");
  const [isFading, setIsFading] = useState<boolean>(false);

  const sceneData = scenario[currentScene];
  const currentData = sceneData[currentLine];

  const typewriter = useTypewriter();
  const saveGame = useSaveGame({
    enabled: currentScreen === "game",
    scene: currentScene,
    line: currentLine,
    bg: currentBg,
  });
  const { displayName, displayImage, displayCharaKey } =
    useCharacterDisplay(currentData);
  const investigation = useInvestigationMode({ typewriter });
  usePreloadImages();

  useEffect(() => {
    if (!currentData || currentScreen !== "game") return;

    if (currentData.type === "start_investigation") {
      const exploreSceneId = currentData.exploreScene;
      const exploreDef = scenario[exploreSceneId][0]; // scenario[exploreSceneId]

      if (exploreDef && exploreDef.type === "investigation") {
        investigation.startInvestigation(exploreDef);
        setCurrentBg(exploreDef.bg);
      } else {
        console.error("指定されたシーンは探索データではありませんでした");
      }

      typewriter.clearText();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine, currentScene, currentScreen, currentData]);

  useEffect(() => {
    if (
      currentScreen === "game" &&
      currentData?.type === "text" &&
      investigation.gameMode === "dialogue"
    ) {
      typewriter.triggerTyping(currentData.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine, currentScene, currentScreen]);

  // 「最初から」遊ぶ時の処理
  const handleStartNewGame = () => {
    saveGame.clearSave();
    setCurrentScene("start");
    setCurrentLine(0);
    setCurrentBg("");
    typewriter.clearText();
    setCurrentScreen("game");
  };

  // 「続きから」遊ぶ時の処理
  const handleContinueGame = () => {
    const saveData = saveGame.loadSave();
    if (saveData) {
      setCurrentScene(saveData.scene as keyof typeof scenario);
      setCurrentLine(saveData.line);
      setCurrentBg(saveData.bg || "");
      typewriter.clearText();
    }
    setCurrentScreen("game");
  };

  // 会話モード中のクリック（次へ進む）処理
  const handleDialogueNext = () => {
    if (!currentData || currentData.type !== "text") return; // bg処理中はクリック無効
    if (currentData.type === "text" && currentData.choices && !allChoicesRead) {
      //選択肢ある時はクリック無効ただし条件全てOKなら進む
      return;
    }
    if (typewriter.isTyping) {
      // 文字が流れている途中にクリック：一気に全文字表示
      typewriter.skipTyping();
    } else {
      if (currentData.type === "text" && currentData.nextScene) {
        const hasChoices = !!currentData.choices;
        if (!hasChoices || allChoicesRead) {
          setLogList((prev) => [
            ...prev,
            { name: displayName, text: currentData.text },
          ]);
          setCurrentScene(currentData.nextScene as keyof typeof scenario);
          setCurrentLine(0);
          typewriter.clearText();
          return;
        }
      }

      // 全文字出終わっている：次のセリフへ
      if (currentLine < sceneData.length - 1) {
        setLogList((prev) => [
          ...prev,
          { name: displayName, text: currentData.text || "" },
        ]);
        typewriter.clearText();
        setCurrentLine((prev) => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (isLogOpen || isItemMenuOpen) return;

    if (investigation.gameMode === "investigation") {
      investigation.handleInvestigationNext();
      return;
    }

    handleDialogueNext();
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

    typewriter.clearText();
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
    return typewriter.displayedText; // タイピング中の文字、または通常の文字
  };

  return {
    currentScreen,
    setCurrentScreen,
    hasSaveData: saveGame.hasSaveData,
    currentScene,
    currentData,
    gameMode: investigation.gameMode,
    exploreDefinition: investigation.exploreDefinition,
    showMessageWindow: investigation.showMessageWindow,
    displayedText: typewriter.displayedText,
    isTyping: typewriter.isTyping,
    isLogOpen,
    setIsLogOpen,
    isItemMenuOpen,
    setIsItemMenuOpen,
    readChoices,
    ownedItems,
    logList,
    currentBg,
    isFading,
    displayName,
    displayImage,
    displayCharaKey,
    allChoicesRead,
    getDisplayText,
    handleStartNewGame,
    handleContinueGame,
    handleNext,
    handleChoice,
    handleHotspotClick: investigation.handleHotspotClick,
  };
}
