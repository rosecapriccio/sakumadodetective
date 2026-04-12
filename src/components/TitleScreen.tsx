import React, { useState } from "react";

interface TitleScreenProps {
  onStartNewGame: () => void;
  onContinueGame: () => void;
  hasSaveData: boolean;
}

// 1. 生成ロジックをコンポーネントの外に置く（すっきり！）
const generateDust = (count: number) => {
  return [...Array(count)].map((_, i) => ({
    id: i,
    bottom: `${Math.random() * 20}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 3 + 1}px`,
    duration: `${Math.random() * 5 + 5}s`,
    delay: `${Math.random() * -5}s`,
  }));
};

export default function TitleScreen({
  onStartNewGame,
  onContinueGame,
  hasSaveData,
}: TitleScreenProps) {
  // 2. useState の初期値に「関数」を渡す！
  // こうすると、コンポーネントが生まれた瞬間に1回だけ実行されます。
  const [dusts] = useState(() => generateDust(12));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "430px",
        aspectRatio: "9/16",
        margin: "0 auto",
        backgroundImage: "url('/images/title_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#111",
        color: "white",
        fontFamily: "serif",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes titleGlow { 0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.4); } 50% { text-shadow: 0 0 20px rgba(255,200,100,0.6); } }
        @keyframes dustAnim { 
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
        }
        
        .title-fade-in { animation: fadeIn 2s ease-out forwards; height: 100%; position: relative; }
        
        .title-button {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.6);
          color: #ddd;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          letter-spacing: 0.2em;
          font-family: serif;
          padding: 15px;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .title-button:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: #ffcc00 !important;
          color: #ffcc00 !important;
          box-shadow: 0 0 15px rgba(255, 204, 0, 0.4);
        }
      `}</style>

      <div className="title-fade-in">
        {/* 塵（ダスト）のエフェクト */}
        {dusts.map((d) => (
          <div
            key={d.id}
            style={{
              position: "absolute",
              bottom: d.bottom,
              left: d.left,
              width: d.size,
              height: d.size,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              borderRadius: "50%",
              animation: `dustAnim ${d.duration} linear infinite`,
              animationDelay: d.delay,
              pointerEvents: "none",
            }}
          />
        ))}

        <h1
          style={{
            position: "absolute",
            top: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "2.2rem",
            width: "100%",
            textAlign: "center",
            margin: 0,
            letterSpacing: "0.15em",
            color: "#fff",
            animation:
              "slideUp 1.5s ease-out 0.5s forwards, titleGlow 4s infinite 2s",
            opacity: 0,
          }}
        >
          Detective x Sakumado
        </h1>

        <div
          style={{
            position: "absolute",
            bottom: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "200px",
            animation: "slideUp 1.5s ease-out 1.2s forwards",
            opacity: 0,
          }}
        >
          <button onClick={onStartNewGame} className="title-button">
            最初から
          </button>

          {hasSaveData && (
            <button onClick={onContinueGame} className="title-button">
              続きから
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
