import styles from "../NovelGame.module.css";

interface TopButtonsProps {
  onOpenLog: () => void;
  onOpenItems: () => void;
}

export default function TopButtons({ onOpenLog, onOpenItems }: TopButtonsProps) {
  return (
    <div className={styles.topButtonsContainer}>
      <button
        className={styles.topButton}
        onClick={(e) => {
          e.stopPropagation();
          onOpenLog();
        }}
      >
        ログ
      </button>
      <button
        className={`${styles.topButton} ${styles.itemButton}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpenItems();
        }}
      >
        証拠品
      </button>
    </div>
  );
}
