import React, { useState, useRef, useEffect } from 'react';
import styles from '../../styles/chat.module.css';

interface IframeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const IframeModal: React.FC<IframeModalProps> = ({ url, title, onClose }) => {
  const [windowState, setWindowState] = useState<'normal' | 'minimized' | 'maximized'>('normal');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState === 'maximized') return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      
      // Simple boundary check could be added here
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const toggleMaximize = () => {
    setWindowState(prev => prev === 'maximized' ? 'normal' : 'maximized');
  };

  const toggleMinimize = () => {
    setWindowState(prev => prev === 'minimized' ? 'normal' : 'minimized');
  };

  const getModalClass = () => {
    if (windowState === 'minimized') return `${styles.iframeModal} ${styles.minimized}`;
    if (windowState === 'maximized') return `${styles.iframeModal} ${styles.maximized}`;
    return styles.iframeModal;
  };

  const getStyle = () => {
    if (windowState === 'maximized' || windowState === 'minimized') return {};
    return {
      transform: `translate(${position.x}px, ${position.y}px)`
    };
  };

  return (
    <div 
      ref={modalRef}
      className={getModalClass()} 
      style={getStyle()}
    >
      <div 
        className={styles.modalHeader}
        onMouseDown={handleMouseDown}
        onDoubleClick={toggleMaximize}
      >
        <span className={styles.modalTitle}>{title}</span>
        <div className={styles.modalControls}>
          <button className={styles.controlBtn} onClick={toggleMinimize} title="最小化">
            _
          </button>
          <button className={styles.controlBtn} onClick={toggleMaximize} title="最大化">
            □
          </button>
          <button className={`${styles.controlBtn} ${styles.closeBtn}`} onClick={onClose} title="关闭">
            ×
          </button>
        </div>
      </div>
      
      {windowState !== 'minimized' && (
        <iframe 
          src={url} 
          className={styles.iframeContent}
          title="Payment Window"
        />
      )}
    </div>
  );
};

export default IframeModal;
