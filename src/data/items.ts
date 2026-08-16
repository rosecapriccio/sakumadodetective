import houki from "../assets/images/cutin/houki.png";
import knife from "../assets/images/cutin/knife.png";
import koitogame from "../assets/images/cutin/koitogame.png";

type ItemData = {
  name: string;
  description: string;
  image: string;
};

export const ITEM_DB: Record<string, ItemData> = {
  houki: {
    name: "ほうき",
    description: "ほうき。部屋のドアにつっかけていて開けなくしていたらしい",
    image: houki,
  },
  knife: {
    name: "ナイフ",
    description: "血痕が付着している。あんま見たことない形。",
    image: knife,
  },
  koito: {
    name: "小糸のちびぐるみ",
    description: "かわいい。事件性は一切感じない",
    image: koitogame,
  },
};
