import { AnimatePresence, motion } from "framer-motion";
import styles from "../NovelGame.module.css";

interface CharacterSpriteProps {
  displayImage: string | null;
  displayCharaKey: string | null;
  visible: boolean;
}

export default function CharacterSprite({
  displayImage,
  displayCharaKey,
  visible,
}: CharacterSpriteProps) {
  return (
    <AnimatePresence mode="wait">
      {displayImage && visible && (
        <motion.img
          key={displayCharaKey}
          src={displayImage}
          alt="character"
          className={styles.characterImage}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ x: "-50%" }}
        />
      )}
    </AnimatePresence>
  );
}
