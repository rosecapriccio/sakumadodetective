"use client"; // ← これを一番上に追加！

import React, { useState, useEffect, useRef } from "react";
import { CHARA_DB } from "../data/characters";
import { scenario } from "../data/scenario";

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
    useState<keyof typeof scenario>("start"); // 現在のシーン
  const [currentLine, setCurrentLine] = useState<number>(0); // 現在のセリフ番号

  const [displayedText, setDisplayedText] = useState<string>(""); // 今画面に表示されている文字
  const [isTyping, setIsTyping] = useState<boolean>(false); // 文字が流れている最中かどうか

  // ▼ 追加1：今まで読んだセリフの履歴を保存する配列（リスト）
  const [logList, setLogList] = useState<{ name?: string; text: string }[]>([]);

  // ▼ 追加2：ログ画面が開いているかどうかのスイッチ
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);

  const sceneData = scenario[currentScene];
  const currentData = sceneData[currentLine];

  const characterInfo = currentData.charaId
    ? CHARA_DB[currentData.charaId]
    : null;

  // 表示する名前（辞書の名前を優先）
  const displayName = characterInfo ? characterInfo.name : currentData.name;

  // 表示する画像パス（辞書の中から、指定された表情faceのパスを取り出す）
  const displayImage =
    characterInfo && currentData.face
      ? characterInfo.faces[currentData.face]
      : null;

  useEffect(() => {
    const savedDataString = localStorage.getItem("my_novel_autosave");
    if (savedDataString) {
      setHasSaveData(true); // セーブデータを発見！
    }
  }, []);

  // 1. オートセーブ機能（監視カメラ）
  useEffect(() => {
    // タイトル画面や設定画面にいる時はセーブしない
    if (currentScreen !== "game") return;

    // 保存するデータをまとめる
    const saveData = {
      scene: currentScene,
      line: currentLine,
    };
    // 'my_novel_autosave' という名前で、ブラウザのメモ帳に上書き保存！
    localStorage.setItem("my_novel_autosave", JSON.stringify(saveData));
  }, [currentScene, currentLine, currentScreen]); // ←「この3つのどれかが変化したら実行してね」という指示

  // ▼ 追加：セリフが切り替わったときに、文字を1文字ずつ流す処理
  useEffect(() => {
    if (currentScreen !== "game") return;
    // セリフが変わるたびに、表示テキストを空にしてタイピング開始状態にする
    setDisplayedText("");
    setIsTyping(true);

    let currentText = "";
    let currentIndex = 0;

    const textArray = Array.from(currentData.text);

    // let currentIndex = 0;
    // const fullText = currentData.text;

    typingTimer.current = setInterval(() => {
      if (currentIndex < textArray.length) {
        // 自分たちの手元で1文字ずつ足していく
        currentText += textArray[currentIndex];
        // 出来上がった文字列をそのままReactに渡す（絶対に削れない！）
        setDisplayedText(currentText);
        currentIndex++;
      } else {
        setIsTyping(false);
        if (typingTimer.current) clearInterval(typingTimer.current);
      }
    }, 50);

    // 次のセリフに行くときや、コンポーネントが消えるときにタイマーをお掃除する（バグ防止）
    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [currentLine, currentScene, currentScreen]);

  // 2. 「最初から」遊ぶ時の処理
  const handleStartNewGame = () => {
    // 古いオートセーブのデータを完全に消去！
    localStorage.removeItem("my_novel_autosave");

    // ゲームの初期状態をセット
    setCurrentScene("start");
    setCurrentLine(0);
    setDisplayedText("");

    // 画面をゲーム本編に切り替える
    setCurrentScreen("game");
  };

  // 3. 「続きから」遊ぶ時の処理
  const handleContinueGame = () => {
    // メモ帳からデータを引っ張り出す
    const savedDataString = localStorage.getItem("my_novel_autosave");

    if (savedDataString) {
      // 文字列を元のオブジェクトに戻す
      const saveData = JSON.parse(savedDataString);

      // 読み込んだデータで、今のシーンと行数を上書きする（ワープ！）
      setCurrentScene(saveData.scene);
      setCurrentLine(saveData.line);
      setDisplayedText("");
    }

    // 画面をゲーム本編に切り替える
    setCurrentScreen("game");
  };

  // --- イベントハンドラ ---
  // ▼ 変更：クリックしたときの処理（スキップ機能の追加）
  const handleNext = () => {
    if (isLogOpen) return;

    if (currentData.choices) return;

    if (isTyping) {
      // パターンA：文字が流れている途中にクリックされたら、一気に全文字表示する
      if (typingTimer.current) clearInterval(typingTimer.current);
      setDisplayedText(currentData.text);
      setIsTyping(false);
    } else {
      // パターンB：文字が全部出終わっている状態なら、次のセリフへ進む
      if (currentLine < sceneData.length - 1) {
        setLogList((prev) => [
          ...prev,
          { name: displayName, text: currentData.text },
        ]);
        setDisplayedText("");
        setCurrentLine((prev) => prev + 1);
      }
    }
  };

  // 選択肢を選んだときの処理
  const handleChoice = (choice: { label: string; nextScene: string }) => {
    // 1. 質問文（今表示されているセリフ）をログに追加
    // 2. 自分が選んだ選択肢も、分かりやすく「▶」などを付けてログに追加
    setLogList((prev) => [
      ...prev,
      { name: displayName, text: currentData.text },
      { text: `▶ 【選択】${choice.label}` }, // 自分の選択として記録
    ]);

    // 3. 画面リセットとシーン移動
    setDisplayedText("");
    setCurrentScene(choice.nextScene as keyof typeof scenario);
    setCurrentLine(0);
  };

  // 画面の振り分け（ルーティング）
  if (currentScreen === "title") {
    return (
      <div
        style={{
          position: "relative", // ★追加1：中の absolute がこの枠外に逃げないようにする！
          width: "100%",
          maxWidth: "430px",
          aspectRatio: "9/16",
          margin: "0 auto",
          backgroundColor: "#111",
          color: "white",
          fontFamily: "serif",
          overflow: "hidden", // ★追加2：万が一はみ出しても枠外を隠す
          // ※ absolute で配置するため、flex 関連の記述は削除してスッキリさせました
        }}
      >
        {/* ▼ タイトルの配置 */}
        <h1
          style={{
            position: "absolute",
            top: "20%", // ★追加：上から20%の位置に配置
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "2rem",
            width: "100%", // 文字が折り返さないように幅を確保
            textAlign: "center", // 中央揃え
            margin: 0, // marginBottomは不要になったので削除
            letterSpacing: "0.1em",
          }}
        >
          『終焉とパスタの狂詩曲』
        </h1>

        {/* ▼ ボタンエリアの配置 */}
        <div
          style={{
            position: "absolute",
            bottom: "25%", // ★追加：下から25%の位置に配置
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
      </div>
    );
  }

  if (currentScreen === "settings") {
    return (
      <div>
        <h1>設定画面（音量とか）</h1>
        <button onClick={() => setCurrentScreen("title")}>
          タイトルに戻る
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleNext}
      style={{
        position: "relative",
        width: "100%",
        // 変更点1: 横幅の最大値をスマホサイズ（iPhone Pro Max等の幅）に制限
        maxWidth: "430px",
        // 変更点2: アスペクト比をスマホの縦長（9:16）に変更
        aspectRatio: "9/16",
        // 変更点3: 画面の高さをスマホのブラウザにピッタリ合わせる
        //height: "100dvh",
        //maxHeight: "100dvh",
        // backgroundColor: currentData.bgImage?.startsWith("#")
        //   ? currentData.bgImage
        //   : "#000",
        // backgroundImage:
        //   currentData.bgImage && !currentData.bgImage.startsWith("#")
        //     ? `url(${currentData.bgImage})`
        //     : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        margin: "0 auto", // PCで見たときは画面の中央に配置される
        overflow: "hidden",
        cursor: currentData.choices ? "default" : "pointer",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)", // PCで見たときにスマホっぽく浮き出させる影
      }}
    >
      {/* 立ち絵の表示エリア */}
      {displayImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayImage}
          alt="character"
          style={{
            position: "absolute",
            bottom: "25%", // メッセージウィンドウの少し上（隠れない位置）に配置
            left: "50%",
            transform: "translateX(-50%)",
            height: "60%", // 画面の高さの60%のサイズにする（画像の大きさに合わせて調整してください）
            //objectFit: "contain", // 画像の縦横比を崩さずに綺麗に収める
            pointerEvents: "none", // ★超重要：画像自体がクリック判定を吸い取らないようにする魔法
            userSelect: "none", // スマホで長押しした時に画像が選択されるのを防ぐ
            //WebkitUserDrag: "none", // PCで画像をドラッグできないようにする
          }}
        />
      )}

      {/* メッセージウィンドウ */}
      <div
        style={{
          position: "absolute",
          bottom: "3%", // スマホの下端ギリギリに配置
          left: "50%",
          transform: "translateX(-50%)",
          width: "94%", // スマホ画面いっぱいまで広げる
          height: "25%", // 縦画面は横幅が狭いので、テキストが改行されやすい分、高さを確保
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "#fff",
          borderRadius: "12px", // スマホっぽく丸みを強くする
          padding: "15px",
          boxSizing: "border-box",
          border: "2px solid rgba(255, 255, 255, 0.4)",
        }}
      >
        {/* 名前表示欄 */}
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

        {/* セリフ本文 */}
        <div style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
          {displayedText}
        </div>

        {/* 選択肢ボタンエリア */}
        {currentData.choices && displayedText === currentData.text && (
          <div
            style={{
              position: "absolute",
              top: "-180%", // スマホ画面に合わせて選択肢の位置を調整
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "80%", // 選択肢のボタンを押しやすいように横幅を広げる
            }}
          >
            {currentData.choices.map((choice, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  // ★変更：choice オブジェクトごと渡すようにする
                  handleChoice(choice);
                }}
                style={{
                  padding: "15px 20px", // スマホの指でタップしやすいように上下の余白（padding）を大きく
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
            ))}
          </div>
        )}
      </div>
      {/* ========================================== */}
      {/* ▼ 追加：ログを開くボタン（画面の右上などに配置） */}
      {/* ========================================== */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // クリックが下の画面に貫通してゲームが進むのを防ぐ
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
          zIndex: 10, // ちょっと手前に持ってくる
        }}
      >
        ログ
      </button>

      {/* ========================================== */}
      {/* ▼ 追加：ログ画面のオーバーレイ（isLogOpen が true の時だけ被さる） */}
      {/* ========================================== */}
      {isLogOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.85)", // 背景を半透明の黒にして被せる
            color: "white",
            zIndex: 100, // 一番手前に表示する
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {/* 閉じるボタン */}
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

          {/* ログの履歴一覧（スクロールできるエリア） */}
          <div
            style={{
              flex: 1, // 残りの高さをすべて使う
              overflowY: "auto", // 縦にスクロール可能にする！
              display: "flex",
              flexDirection: "column",
              gap: "15px", // 履歴ごとの隙間
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
