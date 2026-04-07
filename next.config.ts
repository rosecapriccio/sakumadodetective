import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ▼ 追加1：静的ファイル（ただのHTML）として出力する魔法
  output: "export",

  // ▼ 追加2：GitHub Pagesには画像最適化サーバーがないので、この機能をオフにする
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
