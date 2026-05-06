import { useState, useEffect, useRef } from "react";
import { CHARA_DB } from "./data/characters";
//import { ITEM_DB } from "./data/items";
import type { Hotspot } from "./data/scenario";
import { scenario } from "./data/scenario";

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
  // ▼ 追加2：今の探索シーンの定義を保存する
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

    setFullText(text); // フルテキストを保存
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

    // --- 探索パート開始コマンド (ここを追加！) ---
    if (currentData.type === "start_investigation") {
      const exploreSceneId = currentData.exploreScene;
      const exploreDef = scenario[exploreSceneId][0]; // scenario[exploreSceneId]

      if (exploreDef && exploreDef.type === "investigation") {
        // この中では、TypeScriptが「exploreDefは探索データだ！」と確信してくれます
        setGameMode("investigation");
        setShowMessageWindow(false); // 探索が始まったらウィンドウを消す！
        setExploreDefinition(exploreDef); // これでエラーが消えるはず
        setCurrentBg(exploreDef.bg); // これもOK！
      } else {
        console.error("指定されたシーンは探索データではありませんでした");
      }

      // テキストウィンドウを一旦クリア
      setDisplayedText("");

      // この useEffect はここで終わり（setCurrentLineはしない）
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

  // オートセーブ機能（背景情報も一緒に保存すると復帰時に真っ黒になりません）
  useEffect(() => {
    if (currentScreen !== "game") return;
    const saveData = {
      scene: currentScene,
      line: currentLine,
      bg: currentBg, // ▼ 修正2：セーブデータに今の背景も記録する
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
    setCurrentBg(""); // 背景もリセット
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
      setCurrentBg(saveData.bg || ""); // 背景を復元
      setDisplayedText("");
    }
    setCurrentScreen("game");
  };

  // クリックしたときの処理（次へ）
  const handleNext = () => {
    if (isLogOpen || isItemMenuOpen) return;
    // ▼ 探索モード中の処理を追加
    // --- 探索モード中の挙動 ---
    if (gameMode === "investigation") {
      if (!showMessageWindow) return; // ウィンドウが出てない時は無視

      if (isTyping) {
        // 1回目：タイピング中なら一気に全表示
        if (typingTimer.current) clearInterval(typingTimer.current);
        setDisplayedText(fullText);
        setIsTyping(false);
      } else {
        // 2回目：終わってたらウィンドウを閉じる
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

        const hasChoices = !!currentData.choices; // 選択肢があるか？
        // A. 選択肢がない時：クリックで即遷移
        // B. 選択肢がある時：全部読んでいれば遷移
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
  if (!currentData)
    return <div style={{ backgroundColor: "#000", height: "100vh" }} />;

  return (
    <div
      onClick={handleNext}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "430px",
        aspectRatio: "9/16",
        backgroundImage: currentBg ? `url(${currentBg})` : "none", // ▼ 修正4：背景画像をここで適用！
        backgroundColor: "#000",
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: "0 auto",
        overflow: "hidden",
        cursor:
          currentData.type === "text" && currentData.choices
            ? "default"
            : "pointer",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          // isFadingがtrueなら不透明(1)、falseなら透明(0)
          opacity: isFading ? 1 : 0,
          // 0.5秒かけてフワッと変化させるCSSの魔法
          transition: "opacity 0.5s ease-in-out",
          zIndex: 200, // 画面の全要素（立ち絵やUI）より手前に被せる
          pointerEvents: "none", // これが無いとクリックを吸い取ってゲームが進行しなくなるので必須！
        }}
      />

      {gameMode === "investigation" &&
        exploreDefinition &&
        exploreDefinition.hotspots.map((h: Hotspot) => (
          <div
            key={h.id}
            onClick={(e) => {
              e.stopPropagation(); // 背景のクリック進行を防ぐ

              setShowMessageWindow(true); // メッセージをセットすると同時にウィンドウを出す！
              triggerTyping(h.text);
            }}
            style={{
              position: "absolute",
              // %指定で位置とサイズを決める
              left: `${h.percentX - h.percentWidth / 2}%`, // 中心点を合わせるための計算
              top: `${h.percentY - h.percentHeight / 2}%`,
              width: `${h.percentWidth}%`,
              height: `${h.percentHeight}%`,
              cursor: "pointer",

              // --- 開発時用のヒント ---
              backgroundColor: "rgba(255, 0, 0, 0.3)", // 赤い半透明にして領域を見えるようにする
              border: "2px solid red",
              zIndex: 150, // 立ち絵やウィンドウより手前
            }}
          />
        ))}

      {/* 立ち絵 */}
      {displayImage && currentData.type !== "bg" && (
        <img
          src={displayImage}
          alt="character"
          style={{
            position: "absolute",
            bottom: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            height: "60%",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      )}

      {/* 画像のカットイン */}
      {currentData.type === "text" && currentData.cutin && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={`${currentData.cutin}`}
            alt="cutin"
            style={{
              maxWidth: "80%",
              maxHeight: "80%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
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
          currentChoiceKeyPrefix={`${currentScene}-`} // 現在の行を特定するキー
        />
      )}

      {/* 上部ボタン */}
      {currentData.type !== "bg" && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            gap: "10px",
            zIndex: 10,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLogOpen(true);
            }}
            style={{
              padding: "8px 15px",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              border: "1px solid white",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            ログ
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsItemMenuOpen(true);
            }}
            style={{
              padding: "8px 15px",
              backgroundColor: "rgba(0,50,100,0.6)",
              color: "white",
              border: "1px solid #4db8ff",
              borderRadius: "5px",
              cursor: "pointer",
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
