"use client"; // ← これを一番上に追加！

import { useState, useEffect, useRef } from "react";
import { CHARA_DB } from "./data/characters";
import { scenario } from "./data/scenario";

type ScreenState = "title" | "game" | "settings" | "ending";

// ==========================================
// 3. ゲームコンポーネント本体
// ==========================================
export default function NovelGame() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("title");
  const [hasSaveData, setHasSaveData] = useState(false);

  const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- 状態管理 (Reactのキモ) ---
  const [currentScene, setCurrentScene] =
    useState<keyof typeof scenario>("start");
  const [currentLine, setCurrentLine] = useState<number>(0); // 統合：これ一つで行数を管理します

  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [logList, setLogList] = useState<{ name?: string; text: string }[]>([]);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);

  // 背景とテキストデータの状態
  const [currentBg, setCurrentBg] = useState<string>("");
  const [isFading, setIsFading] = useState<boolean>(false);

  const sceneData = scenario[currentScene];
  const currentData = sceneData[currentLine];

  useEffect(() => {
    if (!currentData || currentScreen !== "game") return;

    if (currentData.type === "bg") {
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
    }
  }, [currentLine, currentScene, currentScreen, currentData]);

  // キャラクター情報の取得
  let displayName = "";
  let displayImage = null;

  if (currentData && currentData.type !== "bg") {
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

  // ▼ 修正3：文字送り処理（bgコマンドの時は動かさないよう安全対策）
  useEffect(() => {
    if (currentScreen !== "game" || !currentData || currentData.type === "bg")
      return;

    setDisplayedText("");
    setIsTyping(true);

    let currentText = "";
    let currentIndex = 0;
    // テキストが無い場合のクラッシュ防止
    const textArray = Array.from(currentData.text || "");

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

    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [currentLine, currentScene, currentScreen, currentData]);

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
    if (isLogOpen) return;
    if (!currentData || currentData.type === "bg") return; // bg処理中はクリック無効
    if (currentData.choices) return; // 選択肢がある時はクリック無効

    if (isTyping) {
      // 文字が流れている途中にクリック：一気に全文字表示
      if (typingTimer.current) clearInterval(typingTimer.current);
      setDisplayedText(currentData.text || "");
      setIsTyping(false);
    } else {
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
    setLogList((prev) => [
      ...prev,
      { name: displayName, text: currentData.text || "" },
      { text: `▶ 【選択】${choice.label}` },
    ]);
    setDisplayedText("");
    setCurrentScene(choice.nextScene as keyof typeof scenario);
    setCurrentLine(0);
  };

  // 画面の振り分け
  if (currentScreen === "title") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "430px",
          aspectRatio: "9/16",
          margin: "0 auto",
          backgroundColor: "#111",
          color: "white",
          fontFamily: "serif",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        <h1
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "2rem",
            width: "100%",
            textAlign: "center",
            margin: 0,
            letterSpacing: "0.1em",
          }}
        >
          『終焉とパスタの狂詩曲』
        </h1>
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "200px",
          }}
        >
          <button
            onClick={handleStartNewGame}
            style={{ padding: "15px", fontSize: "1.2rem", cursor: "pointer" }}
          >
            最初から
          </button>
          {hasSaveData && (
            <button
              onClick={handleContinueGame}
              style={{ padding: "15px", fontSize: "1.2rem", cursor: "pointer" }}
            >
              続きから
            </button>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "5px",
            right: "10px",
            fontSize: "0.7rem",
            color: "rgba(255, 255, 255, 0.4)",
            fontFamily: "sans-serif",
          }}
        >
          Update: {"1.0.0"}
        </div>
      </div>
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

      {/* カットイン */}
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

      <style>{`
        @keyframes bounce-fade {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(3px); opacity: 0.3; }
        }
      `}</style>
      {/* メッセージウィンドウ (bgコマンドの時は隠す) */}
      {currentData.type !== "bg" && (
        <div
          style={{
            zIndex: 100,
            position: "absolute",
            bottom: "3%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "94%",
            height: "25%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            borderRadius: "12px",
            padding: "15px",
            boxSizing: "border-box",
            border: "2px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          {displayName && (
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#4db8ff",
              }}
            >
              {displayName}
            </div>
          )}

          <div style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
            {displayedText}
            {displayedText === currentData.text && !currentData.choices && (
              <span
                style={{
                  display: "inline-block",
                  animation: "bounce-fade 1s infinite",
                  marginLeft: "8px",
                  color: "#ffcc00",
                  fontSize: "0.9rem",
                }}
              >
                ▼
              </span>
            )}
          </div>

          {currentData.choices && displayedText === currentData.text && (
            <div
              style={{
                position: "absolute",
                top: "-180%",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "80%",
              }}
            >
              {currentData.choices.map(
                (
                  choice: { label: string; nextScene: string },
                  index: number,
                ) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoice(choice);
                    }}
                    style={{
                      padding: "15px 20px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      borderRadius: "8px",
                      border: "2px solid #fff",
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      color: "#fff",
                      transition: "background-color 0.2s",
                    }}
                  >
                    {choice.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {/* ログボタン */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsLogOpen(true);
        }}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "8px 15px",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          border: "1px solid white",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        ログ
      </button>

      {/* ログ画面 */}
      {isLogOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "white",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLogOpen(false);
              }}
              style={{
                padding: "10px 20px",
                fontSize: "1.1rem",
                cursor: "pointer",
              }}
            >
              閉じる
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              paddingRight: "10px",
            }}
          >
            {logList.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "50px",
                  color: "#aaa",
                }}
              >
                ログはまだありません
              </div>
            ) : (
              logList.map((log, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                    paddingBottom: "10px",
                    paddingLeft: log.text.startsWith("▶") ? "20px" : "0",
                  }}
                >
                  {log.name && (
                    <div
                      style={{
                        color: "#4db8ff",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        marginBottom: "3px",
                      }}
                    >
                      {log.name}
                    </div>
                  )}
                  <div style={{ lineHeight: "1.5" }}>{log.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
