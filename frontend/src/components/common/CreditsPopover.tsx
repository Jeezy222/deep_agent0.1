import React, { useState } from 'react';
import styles from '../../styles/chat.module.css';

interface CreditsPopoverProps {
  points: number;
  freePoints: number;
  dailyRefresh: number;
  onClose?: () => void;
  onUpgradeClick: () => void;
  style?: React.CSSProperties;
}

const CreditsPopover: React.FC<CreditsPopoverProps> = ({ 
  points, 
  freePoints, 
  dailyRefresh,
  onUpgradeClick,
  style 
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // setIsRedirecting(true); // No longer needed as we use modal
    onUpgradeClick();
  };

  return (
    <div className={styles.creditsPopover} style={style}>
      <div className={styles.popoverHeader}>
        <span className={styles.popoverTitle}>免费</span>
        <button 
            className={styles.upgradeBtn} 
            onClick={handleUpgradeClick}
        >
            升级
        </button>
      </div>

      <div className={styles.popoverSection}>
        <div className={styles.creditsRow}>
          <div className={styles.creditsLabel}>
            <span className={styles.iconSparkle}>✨</span> 
            积分 
            <span className={styles.iconHelp}>?</span>
          </div>
          <div className={styles.creditsValue}>
            {formatNumber(points)} {'>'}
          </div>
        </div>
        <div className={styles.creditsDetail}>
          <span>免费积分</span>
          <span>{formatNumber(freePoints)}</span>
        </div>
      </div>

      <div className={styles.popoverSection}>
        <div className={styles.creditsRow}>
          <div className={styles.creditsLabel}>
            <span className={styles.iconCalendar}>📅</span> 
            每日刷新积分
          </div>
          <div className={styles.creditsValue}>
            {dailyRefresh}
          </div>
        </div>
        <div className={styles.creditsDetail}>
          <span>每天 00:00 刷新为 {dailyRefresh}</span>
        </div>
      </div>

      <div className={styles.popoverFooter}>
        查看使用情况 {'>'}
      </div>
    </div>
  );
};

export default CreditsPopover;
