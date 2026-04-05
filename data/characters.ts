export type FaceType = "normal" | "smile" | "angry" | "sad" | "surprised";

// 2. キャラクター1人分の「ルール」を決める
type CharacterData = {
  name: string;
  // Point💡: Partial を使うと「定義した表情のうち、どれか（全部じゃなくてもOK）」という意味になる
  faces: Partial<Record<FaceType, string>>;
};

// ▼ キャラクターの辞書（マスターデータ）
export const CHARA_DB: Record<string, CharacterData> = {
  madoka: {
    name: "樋口円香",
    faces: {
      normal: "/images/characters/c1.png",
      smile: "/images/characters/c1.png",
      angry: "/images/characters/c1.png",
    },
  },
  sakuya: {
    name: "白瀬咲耶",
    faces: {
      normal: "/images/characters/c2.png",
      smile: "/images/characters/c2.png",
      angry: "/images/characters/c2.png",
    },
  },
} as const; // ← as const をつけるとTypeScriptが賢く補完してくれます

// keyof typeof を使って 'hero' | 'idol' という型を自動生成し、「CharacterId」と名付けて公開する
export type CharacterId = keyof typeof CHARA_DB;
