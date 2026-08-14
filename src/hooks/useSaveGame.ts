import { useEffect, useState } from "react";

const SAVE_KEY = "sakumado_save_data";

type SaveData = {
  scene: string;
  line: number;
  bg: string;
};

interface UseSaveGameParams {
  enabled: boolean;
  scene: string;
  line: number;
  bg: string;
}

export function useSaveGame({ enabled, scene, line, bg }: UseSaveGameParams) {
  const [hasSaveData] = useState(() => localStorage.getItem(SAVE_KEY) !== null);

  // オートセーブ機能
  useEffect(() => {
    if (!enabled) return;
    const saveData: SaveData = { scene, line, bg };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }, [enabled, scene, line, bg]);

  const loadSave = (): SaveData | null => {
    const savedDataString = localStorage.getItem(SAVE_KEY);
    return savedDataString ? JSON.parse(savedDataString) : null;
  };

  const clearSave = () => localStorage.removeItem(SAVE_KEY);

  return { hasSaveData, loadSave, clearSave };
}
