import NovelGame from "../components/NovelGame";

export default function Home() {
  return (
    <main
      style={{
        padding: "20px",
        backgroundColor: "#f0f0f0",
        minHeight: "100vh",
      }}
    >
      {/* <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        マイ ノベルゲーム
      </h1> */}

      {/* ここで先ほどのゲームコンポーネントを呼び出します */}
      <NovelGame />
    </main>
  );
}
