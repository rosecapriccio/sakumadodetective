import { useEffect, useRef } from "react";
import { CHARA_DB } from "../data/characters";

// キャラクター立ち絵のプリロード処理
export function usePreloadImages() {
  const preloadedImages = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    Object.values(CHARA_DB).forEach((chara) => {
      Object.values(chara.faces).forEach((imagePath) => {
        const img = new Image();
        img.src = `${imagePath}`;
        preloadedImages.current.push(img);
      });
    });
  }, []);
}
