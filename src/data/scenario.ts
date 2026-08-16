import type { CharacterId, FaceType } from "./characters";
import bgVenue from "../assets/images/bg/venue.png";
import bgWarehouse from "../assets/images/bg/warehouse.png";
import cutinHouki from "../assets/images/cutin/houki.png";

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

export type Command =
  | {
      type: "text";
      text: string;
      name?: string;
      charaId?: CharacterId;
      face?: FaceType;
      choices?: ChoiceOption[];
      cutin?: string;
      nextScene?: string;
    }
  | {
      type: "bg";
      bg: string;
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
      bg: bgVenue,
    },
    {
      type: "text",
      //charaId: "madoka",
      //face: "normal",
      text: "なんだこの部屋……薄暗くて気味が悪いな。",
    },
    {
      type: "text",
      //charaId: "madoka",
      //face: "normal",
      text: "壁一面に不気味な絵画が飾られており、異様な雰囲気を放っている。",
    },
    {
      type: "text",
      //charaId: "madoka",
      //face: "normal",
      text: "奥へ進もうとしたその時、足音が響いた。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "プロデューサー、無事だったかい？",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "smile",
      text: "足元に何かが落ちていたよ。これを見てくれるかい？足元に何かが落ちていたよ。これを見てくれるかい？足元に何かが落ちていたよ。これを見てくれるかい？",
    },
    {
      type: "text",
      name: "",
      text: "泥にまみれた、古ぼけた石板だった。",
      cutin: cutinHouki,
    },
    {
      type: "get_item",
      //text: "ほうきを手に入れた",
      itemId: "houki",
    },
    {
      type: "get_item",
      //text: "ほうきを手に入れた",
      itemId: "koito",
    },
    {
      type: "get_item",
      //text: "ほうきを手に入れた",
      itemId: "knife",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "表面の泥を払えば、何かの手がかりになるかもしれないね。",
      nextScene: "choice2",
    },
  ],
  choice2: [
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "急に出てこないでください……心臓に悪いです。それで、次はどこへ？",
      choices: [
        { label: "右の道へ行く", nextScene: "start2" },
        // { label: "左の道へ行く", nextScene: "start3" },
        // { label: "元の道へ戻る", nextScene: "start4" },
      ],
      nextScene: "scene_right",
    },
  ],
  start2: [
    {
      type: "text",
      text: "右の通路へ進むと、開けた場所に出た。",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "normal",
      text: "ここが一番怪しいね。何か見つかるかもしれない。",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "smile",
      text: "よし、周辺を詳しく調べてみようか。",
      nextScene: "choice2",
    },
  ],
  start3: [
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "左の通路は……ひどく湿っぽくて嫌な予感がするな。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "足元に気をつけて進もう。",
      nextScene: "choice2",
    },
  ],
  start4: [
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "引き返すのかい？ 確かに一度冷静になるのも手だね。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "normal",
      text: "もう一度、手がかりを見落としていないか確認しよう。",
      nextScene: "choice2",
    },
  ],
  scene_right: [
    // {
    //   type: "text",
    //   charaId: "sakuya",
    //   face: "smile",
    //   text: "よし、ひとまずこの部屋は安全そうだね。",
    // },
    {
      type: "bg",
      //charaId: "madoka",
      //face: "normal",
      bg: bgWarehouse,
    },
    {
      type: "text",
      charaId: "madoka",
      face: "smile",
      text: "……油断は禁物ですよ。ここは倉庫のようですね。",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "……油断は禁物ですよ。ここは倉庫のようですね。",
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
      text: "怪しい箇所をいくつか見つけたよ。調査を始めよう。",
    },
  ],
  scene_left: [
    {
      type: "text",
      // charaId: "sakuya",
      // face: "angry",
      text: "カチリ、と足元で嫌な音が響いた。",
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
      text: "危ない！ 下がって、プロデューサー！",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "……間一髪でしたね。仕掛け罠でしょうか。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "どうやら侵入者を本気で拒んでいるようだ。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "こんな危険な場所に一人で行かせるわけにはいかないな。",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "ええ、慎重に進みましょう。命がいくつあっても足りません。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "このナイフ、誰かが仕掛けたばかりのようだね……。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "まだ近くに潜んでいる可能性がある。",
    },
    {
      type: "text",
      charaId: "madoka",
      face: "angry",
      text: "……背後に注意してください。すぐ戻りましょう。",
    },
    {
      type: "text",
      charaId: "sakuya",
      face: "angry",
      text: "了解だ。警戒を怠らずに行こう。",
    },
  ],
  crime_scene: [
    {
      type: "investigation",
      bg: bgWarehouse,
      hotspots: [
        {
          id: "sticker2",
          percentX: 89,
          percentY: 48,
          percentWidth: 15,
          percentHeight: 15,
          text: "壁に紙が貼ってある。何かの暗号が記されているようだ。",
        },
        {
          id: "sticker1",
          percentX: 14,
          percentY: 56,
          percentWidth: 16,
          percentHeight: 14,
          text: "ダンボールの側面に、走り書きのメモが貼り付けられている。",
        },
        {
          id: "window",
          percentX: 63,
          percentY: 47,
          percentWidth: 27,
          percentHeight: 16,
          text: "窓の外は土砂降りの雨だ。外から侵入した形跡は見当たらない。",
        },
      ],
    },
  ],
};
