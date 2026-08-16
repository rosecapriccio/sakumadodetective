import { useState } from "react";
import type { Hotspot } from "../data/scenario";
import type { useTypewriter } from "./useTypewriter";

export type GameMode = "dialogue" | "investigation";
export type InvestigationData = {
  type: "investigation";
  bg: string;
  hotspots: Hotspot[];
};

interface UseInvestigationModeParams {
  typewriter: ReturnType<typeof useTypewriter>;
}

export function useInvestigationMode({ typewriter }: UseInvestigationModeParams) {
  const [gameMode, setGameMode] = useState<GameMode>("dialogue");
  const [exploreDefinition, setExploreDefinition] =
    useState<InvestigationData>();
  const [showMessageWindow, setShowMessageWindow] = useState<boolean>(true); // 初期値はtrue（会話から始まるため）

  // 探索パートへの遷移
  const startInvestigation = (exploreDef: InvestigationData) => {
    setGameMode("investigation");
    setShowMessageWindow(false);
    setExploreDefinition(exploreDef);
  };

  // 探索モードのホットスポットをクリックしたときの処理
  const handleHotspotClick = (h: Hotspot) => {
    setShowMessageWindow(true);
    typewriter.triggerTyping(h.text);
  };

  // 探索モード中のクリック（次へ進む）処理
  const handleInvestigationNext = () => {
    if (!showMessageWindow) return;

    if (typewriter.isTyping) {
      typewriter.skipTyping();
    } else {
      setShowMessageWindow(false);
      typewriter.clearText();
    }
  };

  return {
    gameMode,
    exploreDefinition,
    showMessageWindow,
    startInvestigation,
    handleHotspotClick,
    handleInvestigationNext,
  };
}
