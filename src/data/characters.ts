import mano1 from "../assets/images/characters/mano1.png";
import mano2 from "../assets/images/characters/mano2.png";
import mano3 from "../assets/images/characters/mano3.png";
import hiori1 from "../assets/images/characters/hiori1.png";
import hiori2 from "../assets/images/characters/hiori2.png";
import hiori3 from "../assets/images/characters/hiori3.png";

export type FaceType = "normal" | "smile" | "angry" | "sad" | "surprised";

type CharacterData = {
  name: string;
  faces: Partial<Record<FaceType, string>>;
};

export const CHARA_DB: Record<string, CharacterData> = {
  madoka: {
    name: "樋口円香",
    faces: {
      normal: mano1,
      smile: mano2,
      angry: mano3,
    },
  },
  sakuya: {
    name: "白瀬咲耶",
    faces: {
      normal: hiori1,
      smile: hiori2,
      angry: hiori3,
    },
  },
} as const;

export type CharacterId = keyof typeof CHARA_DB;
