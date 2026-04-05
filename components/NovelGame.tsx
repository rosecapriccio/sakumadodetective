"use client"; // ← これを一番上に追加！

import React, { useState, useEffect } from "react";
import { CHARA_DB } from "../data/characters";
import { scenario } from "../data/scenario";

// ==========================================
// 3. ゲームコンポーネント本体
// ==========================================
export default function NovelGame() {
  // --- 状態管理 (Reactのキモ) ---
  const [currentScene, setCurrentScene] =
    useState<keyof typeof scenario>("start"); // 現在のシーン
  const [currentLine, setCurrentLine] = useState<number>(0); // 現在のセリフ番号

  const [displayedText, setDisplayedText] = useState<string>(""); // 今画面に表示されている文字
  const [isTyping, setIsTyping] = useState<boolean>(false); // 文字が流れている最中かどうか

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

  // ▼ 追加：セリフが切り替わったときに、文字を1文字ずつ流す処理
  useEffect(() => {
    // セリフが変わるたびに、表示テキストを空にしてタイピング開始状態にする
    setDisplayedText("");
    setIsTyping(true);

    let currentText = "";
    let currentIndex = 0;

    const textArray = Array.from(currentData.text);

    // let currentIndex = 0;
    // const fullText = currentData.text;

    const timer = setInterval(() => {
      if (currentIndex < textArray.length) {
        // 自分たちの手元で1文字ずつ足していく
        currentText += textArray[currentIndex];
        // 出来上がった文字列をそのままReactに渡す（絶対に削れない！）
        setDisplayedText(currentText);
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);

    // 次のセリフに行くときや、コンポーネントが消えるときにタイマーをお掃除する（バグ防止）
    return () => clearInterval(timer);
  }, [currentData.text]); // currentData.text（セリフ）が変わった時だけこの処理を実行する

  // --- イベントハンドラ ---
  // ▼ 変更：クリックしたときの処理（スキップ機能の追加）
  const handleNext = () => {
    if (currentData.choices) return;

    if (isTyping) {
      // パターンA：文字が流れている途中にクリックされたら、一気に全文字表示する
      setDisplayedText(currentData.text);
      setIsTyping(false);
    } else {
      // パターンB：文字が全部出終わっている状態なら、次のセリフへ進む
      if (currentLine < sceneData.length - 1) {
        setDisplayedText("");
        setCurrentLine((prev) => prev + 1);
      }
    }
  };

  // 選択肢を選んだときの処理
  const handleChoice = (nextScene: string) => {
    setCurrentScene(nextScene);
    setCurrentLine(0); // セリフ番号を最初に戻す
  };

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
                  handleChoice(choice.nextScene);
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
    </div>
  );
}
