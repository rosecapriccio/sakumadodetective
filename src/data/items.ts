type ItemData = {
  name: string;
  description: string;
  image: string;
};

export const ITEM_DB: Record<string, ItemData> = {
  houki: {
    name: "ほうき",
    description: "ほうき。部屋のドアにつっかけていて開けなくしていたらしい",
    image: "/sakumadodetective/images/cutin/houki.png",
  },
  knife: {
    name: "ナイフ",
    description: "血痕が付着している。あんま見たことない形。",
    image: "/sakumadodetective/images/cutin/knife.png",
  },
  koito: {
    name: "小糸のちびぐるみ",
    description: "かわいい。事件性は一切感じない",
    image: "/sakumadodetective/images/cutin/koitogame.png",
  },
};
