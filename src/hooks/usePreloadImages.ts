import { useEffect, useRef } from "react";

// src/assets/images 配下の画像を、フォルダを問わず全て集める
const allImageUrls = Object.values(
  import.meta.glob("../assets/images/**/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),
) as string[];

// 画像を丸ごとプリロードする処理
export function usePreloadImages() {
  const preloadedImages = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    allImageUrls.forEach((imagePath) => {
      const img = new Image();
      img.src = imagePath;
      preloadedImages.current.push(img);
    });
  }, []);
}
