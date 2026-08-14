export type FaceType = "normal" | "smile" | "angry" | "sad" | "surprised";

type CharacterData = {
  name: string;
  faces: Partial<Record<FaceType, string>>;
};

export const CHARA_DB: Record<string, CharacterData> = {
  madoka: {
    name: "樋口円香",
    faces: {
      normal: "/sakumadodetective/images/characters/mano1.png",
      smile: "/sakumadodetective/images/characters/mano2.png",
      angry: "/sakumadodetective/images/characters/mano3.png",
    },
  },
  sakuya: {
    name: "白瀬咲耶",
    faces: {
      normal: "/sakumadodetective/images/characters/hiori1.png",
      smile: "/sakumadodetective/images/characters/hiori2.png",
      angry: "/sakumadodetective/images/characters/hiori3.png",
    },
  },
} as const;

export type CharacterId = keyof typeof CHARA_DB;
