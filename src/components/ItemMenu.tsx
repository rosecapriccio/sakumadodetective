import { useState } from "react";
import styles from "./ItemMenu.module.css";
import { ITEM_DB } from "../data/items";

interface ItemMenuProps {
  ownedItems: string[];
  onClose: () => void;
}

export default function ItemMenu({ ownedItems, onClose }: ItemMenuProps) {
  // メニュー内でのみ必要な状態（どのアイテムを選択中か）をここに移動！
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <h2 className={styles.title}>証拠品・情報リスト</h2>
        <button
          className={styles.closeBtn}
          onClick={() => {
            setSelectedId(null); // 閉じる時に選択をリセット
            onClose();
          }}
        >
          閉じる
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* 左側：リスト */}
        <div className={styles.itemList}>
          {ownedItems.length === 0 ? (
            <div className={styles.emptyMsg}>まだ情報がありません</div>
          ) : (
            ownedItems.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedId(id)}
                className={`${styles.itemBtn} ${selectedId === id ? styles.itemBtnActive : ""}`}
              >
                {ITEM_DB[id]?.name || "???"}
              </button>
            ))
          )}
        </div>

        {/* 右側：詳細表示 */}
        <div className={styles.details}>
          {selectedId ? (
            <div>
              <div className={styles.imageBox}>
                {ITEM_DB[selectedId].image ? (
                  <img
                    src={ITEM_DB[selectedId].image}
                    alt={ITEM_DB[selectedId].name}
                    className={styles.itemImage}
                  />
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#4db8ff" }}>
                    NO IMAGE
                  </span>
                )}
              </div>
              <h3 className={styles.itemName}>{ITEM_DB[selectedId].name}</h3>
              <p className={styles.description}>
                {ITEM_DB[selectedId].description}
              </p>
            </div>
          ) : (
            <div className={styles.emptyMsg}>
              証拠品を選択して
              <br />
              ください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
