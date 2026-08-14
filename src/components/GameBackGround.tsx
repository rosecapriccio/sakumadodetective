// components/GameBackground.tsx
import { motion, AnimatePresence } from "framer-motion";

interface GameBackgroundProps {
  currentBg: string;
}

export default function GameBackground({ currentBg }: GameBackgroundProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        zIndex: 0, // 立ち絵やUIの後ろ
      }}
    >
      {/* mode="wait" をつけることで、古い背景が消えきってから新しい背景が出ます */}
      <AnimatePresence mode="wait">
        {currentBg && (
          <motion.div
            key={currentBg} // ◀ ここが超重要！背景URLが変わるとFramer Motionが自動検知します
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url(${currentBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
