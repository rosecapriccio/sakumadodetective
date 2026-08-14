import type { Hotspot } from "../data/scenario";
import styles from "../NovelGame.module.css";

interface InvestigationHotspotsProps {
  hotspots: Hotspot[];
  onHotspotClick: (h: Hotspot) => void;
}

export default function InvestigationHotspots({
  hotspots,
  onHotspotClick,
}: InvestigationHotspotsProps) {
  return (
    <>
      {hotspots.map((h) => (
        <div
          key={h.id}
          className={`${styles.hotspot} ${styles.debug}`}
          onClick={(e) => {
            e.stopPropagation();
            onHotspotClick(h);
          }}
          style={{
            left: `${h.percentX - h.percentWidth / 2}%`,
            top: `${h.percentY - h.percentHeight / 2}%`,
            width: `${h.percentWidth}%`,
            height: `${h.percentHeight}%`,
          }}
        />
      ))}
    </>
  );
}
