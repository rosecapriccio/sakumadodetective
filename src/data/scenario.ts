import type { CharacterId, FaceType } from "./characters";

export type ChoiceOption = {
  label: string;
  nextScene: string;
};

export type Hotspot = {
  id: string;
  percentX: number;
  percentY: number;
  percentWidth: number;
  percentHeight: number;
  text: string;
  itemId?: string; // アイテムを手に入れるなら
  nextScene?: string; // 別のシーンへ飛ぶなら
};

// 2. 台本1行分のルール（型）を定義する
export type Command =
  | {
      type: "text";
      text: string; // ◀ ?は付けない！textの時は絶対にある
      name?: string;
      charaId?: CharacterId;
      face?: FaceType;
      choices?: ChoiceOption[];
      cutin?: string;
      nextScene?: string;
    }
  | {
      type: "bg";
      bg: string; // ◀ ?は付けない！bgの時は絶対にある
    }
  | {
      type: "get_item";
      //text: string;
      itemId: string;
    }
  | {
      type: "start_investigation";
      //text: string;
      exploreScene: string;
    }
  | {
      type: "investigation";
      bg: string;
      //exploreScene: string;
      hotspots: Hotspot[];
    };

export const scenario: Record<string, Command[]> = {
  start: [
    {
      type: "bg",
      //charaId: "madoka",
      //face: "normal",
      bg: "/sakumadodetective/images/bg/venue.png",
    },
    {
      type: "text",
      //charaId: "madoka",
      //face: "normal",
      text: "なんだこの部屋……気味が悪いな。",
    },
    {
      type: "text",
      //charaId: "madoka",
      //face: "normal",
      text: "周りには絵が飾られており、周囲の目を惹く",
    },
    {
      type: "text",
      //charaId: "madoka",
      //face: "normal",
      text: "咲耶の前に当然あさひが現れる",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "「プロデューサーさん、お疲れ様ですっ！」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "これを見てください！",
    },
    {
      type: "text",
      name: "",
      text: "泥にまみれた、古ぼけた石板だった。",
      cutin: "/sakumadodetective/images/cutin/houki.png",
    },
    {
      type: "get_item",
      //text: "ほうきを手に入れた",
      itemId: "houki",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "これださい！",
      nextScene: "choice2",
    },
  ],
  choice2: [
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "「急にどこから出てきた！？」",
      choices: [
        { label: "右の道へ行く", nextScene: "start2" },
        { label: "左の道へ行く", nextScene: "start3" },
        { label: "元の道へ行く", nextScene: "start4" },
      ],
      nextScene: "scene_right",
    },
  ],
  start2: [
    {
      type: "text",
      text: "咲耶の前に当然あさひが現れる",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "「プロデューサーさん、お疲れ様ですっ！」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "これを見てください！",
      nextScene: "choice2",
    },
  ],
  start3: [
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "「プロれ様ですっ！」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "これを見ださい！",
      nextScene: "choice2",
    },
  ],
  start4: [
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "「プですっ！」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "これを見い！",
      nextScene: "choice2",
    },
  ],
  scene_right: [
    {
      type: "text",
      charaId: "sakuya",
      face: "smile",
      text: "「こっちは安全そうだ。」",
    },
    {
      type: "bg",
      //charaId: "madoka",
      //face: "normal",
      bg: "/sakumadodetective/images/bg/warehouse.png",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "smile",
      text: "「ああああああああああああああ」",
    },
    { type: "start_investigation", exploreScene: "crime_scene" },
    {
      type: "get_item",
      //text: "ほうきを手に入れた",
      itemId: "koito",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "smile",
      text: "「全然もうええわ。」",
    },
  ],
  scene_left: [
    {
      type: "text",
      // charaId: "sakuya",
      // face: "angry",
      text: "「うわっ！罠だ！」",
    },
    {
      type: "get_item",
      //text: "ほうきを手に入れた",
      itemId: "knife",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "いや変人で結構",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "「葛藤と格闘してました？」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "ありがとうあじゃ絶対無理やろもうていんあああああああああああああ",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "いや変人で結構",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "「葛藤と格闘してました？」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "ありがとうあじゃ絶対無理やろもうていんあああああああああああああ",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "いや変人で結構",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "「葛藤と格闘してました？」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "ありがとうあじゃ絶対無理やろもうていんあああああああああああああ",
    },
  ],
  crime_scene: [
    {
      type: "investigation",
      bg: "/sakumadodetective/images/bg/warehouse.png",
      hotspots: [
        {
          id: "sticker2",
          percentX: 89,
          percentY: 48,
          percentWidth: 15,
          percentHeight: 15,
          text: "壁に紙が貼ってある。暗号が書かれている",
        },
        {
          id: "sticker1",
          percentX: 14,
          percentY: 56,
          percentWidth: 16,
          percentHeight: 14,
          text: "ダンボールに紙が貼ってある",
        },
        {
          id: "window",
          percentX: 63,
          percentY: 47,
          percentWidth: 27,
          percentHeight: 16,
          text: "窓の外は雨が降っている。誰も通った形跡はない。",
        },
      ],
    },
  ],
};
