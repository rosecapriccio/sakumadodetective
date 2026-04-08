import type { CharacterId, FaceType } from "./characters";

export type ChoiceOption = {
  label: string;
  nextScene: string;
};

// 2. 台本1行分のルール（型）を定義する
export type Command = {
  type: "text";
  name?: string; // 辞書を使わないモブキャラ用の名前（?は「無くてもいい」の意味）

  // ▼ ここが最大のポイント！
  // charaId は単なる string ではなく、「CharacterId ('hero' | 'idol') しか絶対に許さない！」と縛る
  charaId?: CharacterId;

  face?: FaceType;
  text: string;
  choices?: ChoiceOption[];
};

export const scenario: Record<string, Command[]> = {
  start: [
    {
      type: "text",
      //charaId: "madoka",
      //face: "normal",
      text: "「なんだこの部屋……気味が悪いな。」",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "「プロデューサーさん、お疲れ様ですっ！」",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "「急にどこから出てきた！？」",
      choices: [
        { label: "右の道へ行く", nextScene: "scene_right" },
        { label: "左の道へ行く", nextScene: "scene_left" },
      ],
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
      type: "text",
      charaId: "madoka",
      face: "smile",
      text: "「ああああああああああああああ」",
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
};

// // data/scenario.ts
// export type Choice = { label: string; nextScene: string };
// export type ScenarioLine = {
//   name: string;
//   text: string;
//   bgImage?: string;
//   characterImage?: string;
//   choices?: Choice[];
// };
// export type ScenarioData = Record<string, ScenarioLine[]>;

// export const scenario: ScenarioData = {
//   start: [
//     { name: "", text: "ある日の午後。", bgImage: "#2c3e50" },
//     {
//       name: "主人公",
//       text: "「ふぅ、やっと作業が終わったぞ。」",
//       characterImage: "/images/characters/c1.png",
//     },
//     {
//       name: "謎の声",
//       text: "「お疲れ様！ちょっと息抜きしない？」",
//       characterImage: "/images/characters/c2.png",
//     },
//     {
//       name: "主人公",
//       text: "「（どうしようかな…）」",
//       choices: [
//         { label: "外に出る", nextScene: "outside" },
//         { label: "まだ作業を続ける", nextScene: "work" },
//       ],
//     },
//   ],
//   outside: [
//     {
//       name: "主人公",
//       text: "「よし、少し散歩でもしてこよう。」",
//       bgImage: "#27ae60",
//       //characterImage: "🚶",
//     },
//     { name: "", text: "ー HAPPY END ー" },
//   ],
//   work: [
//     {
//       name: "主人公",
//       text: "「いや、ここで休むわけにはいかない！」",
//       bgImage: "#8e44ad",
//       //characterImage: "🔥",
//     },
//     { name: "", text: "ー BAD END ー" },
//   ],
// };
