import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ▼ 追加1：静的ファイル（ただのHTML）として出力する魔法
  output: "export",

  // ▼ 追加2：GitHub Pagesには画像最適化サーバーがないので、この機能をオフにする
  images: {
    unoptimized: true,
  },

  basePath: "/sakumadodetective",

  // ▼ 追加：ビルドした瞬間の「日本時間」を自動で記録する！
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    }),
  },
};

export default nextConfig;
