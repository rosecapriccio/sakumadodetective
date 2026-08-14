import { AnimatePresence, motion } from "framer-motion";
import type { useNovelEngine } from "../hooks/useNovelEngine";
import styles from "../NovelGame.module.css";

import CharacterSprite from "./CharacterSprite";
import InvestigationHotspots from "./InvestigationHotspots";
import TopButtons from "./TopButtons";
import MessageWindow from "./MessageWindow";
import ItemMenu from "./ItemMenu";
import LogMenu from "./LogMenu";

interface GameScreenProps {
  engine: ReturnType<typeof useNovelEngine>;
}

export default function GameScreen({ engine }: GameScreenProps) {
  const {
    currentScene,
    currentData,
    gameMode,
    exploreDefinition,
    showMessageWindow,
    displayedText,
    isTyping,
    isLogOpen,
    setIsLogOpen,
    isItemMenuOpen,
    setIsItemMenuOpen,
    readChoices,
    ownedItems,
    logList,
    currentBg,
    isFading,
    displayName,
    displayImage,
    displayCharaKey,
    allChoicesRead,
    getDisplayText,
    handleNext,
    handleChoice,
    handleHotspotClick,
  } = engine;

  return (
    <div
      className={styles.mainContainer}
      onClick={handleNext}
      style={{
        backgroundImage: currentBg ? `url(${currentBg})` : "none",
      }}
    >
      <AnimatePresence>
        <motion.div
          key={currentBg || "default-bg"}
          className={styles.fadeOverlay}
          initial={{ opacity: 1 }}
          animate={{ opacity: isFading ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {gameMode === "investigation" && exploreDefinition && (
        <InvestigationHotspots
          hotspots={exploreDefinition.hotspots}
          onHotspotClick={handleHotspotClick}
        />
      )}

      {/* 立ち絵 */}
      <CharacterSprite
        displayImage={displayImage}
        displayCharaKey={displayCharaKey}
        visible={currentData.type !== "bg"}
      />

      {/* 画像のカットイン */}
      {currentData.type === "text" && currentData.cutin && (
        <div className={styles.cutinContainer}>
          <img
            src={`${currentData.cutin}`}
            alt="cutin"
            className={styles.cutinImage}
          />
        </div>
      )}

      {/* メッセージウィンドウ */}
      {(currentData.type == "text" ||
        currentData.type == "start_investigation") && (
        <MessageWindow
          show={
            (currentData.type === "text" ||
              currentData.type === "start_investigation") &&
            showMessageWindow
          }
          name={displayName}
          text={getDisplayText()}
          isTyping={isTyping}
          choices={
            currentData.type === "text" ? currentData.choices : undefined
          }
          showChoices={
            currentData.type === "text" &&
            displayedText === currentData.text &&
            !allChoicesRead
          }
          onChoiceSelect={handleChoice}
          readChoices={readChoices}
          currentChoiceKeyPrefix={`${currentScene}-`}
        />
      )}

      {/* 上部ボタン */}
      {currentData.type !== "bg" && (
        <TopButtons
          onOpenLog={() => setIsLogOpen(true)}
          onOpenItems={() => setIsItemMenuOpen(true)}
        />
      )}

      {/* ログ画面 */}
      {isLogOpen && (
        <LogMenu logList={logList} onClose={() => setIsLogOpen(false)} />
      )}

      {/* 証拠品リスト画面 */}
      {isItemMenuOpen && (
        <ItemMenu
          ownedItems={ownedItems}
          onClose={() => setIsItemMenuOpen(false)}
        />
      )}
    </div>
  );
}
