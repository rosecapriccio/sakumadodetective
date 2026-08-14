import { CHARA_DB } from "../data/characters";
import type { Command } from "../data/scenario";

// キャラクター情報の取得
export function useCharacterDisplay(currentData: Command | undefined) {
  let displayName = "";
  let displayImage: string | null = null;
  let displayCharaKey: string | null = null;

  if (currentData && currentData.type === "text") {
    const characterInfo = currentData.charaId
      ? CHARA_DB[currentData.charaId]
      : null;
    displayName = characterInfo ? characterInfo.name : currentData.name || "";
    displayImage =
      (characterInfo && currentData.face
        ? characterInfo.faces[currentData.face]
        : null) ?? null;
    displayCharaKey = currentData.charaId || null;
  }

  return { displayName, displayImage, displayCharaKey };
}
