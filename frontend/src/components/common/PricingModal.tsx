import React, { useState } from 'react';
import styles from '../../styles/pricing.module.css';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('PricingModal: Backdrop clicked, closing modal');
      onClose();
    }
  };

  // Icons
  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
  
  const FileTextIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  const LayoutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  );

  const PresentationIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
      <line x1="12" y1="17" x2="12" y2="21"></line>
      <line x1="8" y1="21" x2="16" y2="21"></line>
    </svg>
  );
  
  const GlobeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );

  const BeakerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.31"></path>
      <path d="M14 2v7.31"></path>
      <path d="M8.5 2h7"></path>
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
    </svg>
  );

  const ListIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const InfoIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'help' }}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );

  const BuildingIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="22" x2="9" y2="12"></line>
      <line x1="15" y1="12" x2="15" y2="22"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
    </svg>
  );

  const ArrowUpRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>升级到 Manus Pro</h2>
            <div className={styles.toggleContainer}>
              <button 
                className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.active : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                月付
              </button>
              <button 
                className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.active : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                年付 <span className={styles.saveBadge}>· 节省17%</span>
              </button>
            </div>
          </div>

          <div className={styles.plansContainer}>
            {/* Basic Plan */}
            <div className={styles.planCard}>
              <div className={styles.price}>
                $20 <span className={styles.period}>/ 月</span>
              </div>
              <div className={styles.description}>基础月度用量</div>
              <button 
                className={`${styles.actionBtn} ${styles.btnDark}`}
                onClick={() => onSelectPlan('basic', billingCycle)}
              >
                升级
              </button>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><ClockIcon /></div>
                  300 每日刷新积分
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><StarIcon /></div>
                  4,000 月度积分 <span className={styles.infoIcon}><InfoIcon /></span>
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><FileTextIcon /></div>
                  日常任务的深度研究
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><LayoutIcon /></div>
                  专业网站的标准输出
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><PresentationIcon /></div>
                  常规内容的分析型幻灯片
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><GlobeIcon /></div>
                  任务扩展支持广度研究
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><BeakerIcon /></div>
                  抢先体验 Beta 功能
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><ListIcon /></div>
                  20 个并发任务
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><CalendarIcon /></div>
                  20 个定时任务
                </li>
              </ul>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className={`${styles.planCard} ${styles.highlighted}`}>
              <div className={styles.price}>
                7 天免费
              </div>
              <div className={styles.originalPrice}>然后 $40 / 月</div>
              <div className={styles.description}>可自定义月度用量</div>
              <button 
                className={`${styles.actionBtn} ${styles.btnPrimary}`}
                onClick={() => onSelectPlan('standard', billingCycle)}
              >
                开始免费试用
              </button>
              
              <div className={styles.creditsSelect}>
                <span>8,000 积分 / 每月</span>
                <span style={{ color: '#0070f3', fontSize: '12px' }}>免费试用 ⌄</span>
              </div>

              <ul className={styles.featuresList}>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><ClockIcon /></div>
                  300 每日刷新积分
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><StarIcon /></div>
                  8,000 月度积分 <span className={styles.infoIcon}><InfoIcon /></span>
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><FileTextIcon /></div>
                  自定义用量的深度研究
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><LayoutIcon /></div>
                  应对复杂需求的专业网站
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><PresentationIcon /></div>
                  深度创作的分析型幻灯片
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><GlobeIcon /></div>
                  极速推进计划的广度研究
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><BeakerIcon /></div>
                  抢先体验 Beta 功能
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><ListIcon /></div>
                  20 个并发任务
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><CalendarIcon /></div>
                  20 个定时任务
                </li>
              </ul>
            </div>

            {/* Enterprise/Plus Plan */}
            <div className={styles.planCard}>
              <div className={styles.price}>
                $200 <span className={styles.period}>/ 月</span>
              </div>
              <div className={styles.description}>可提升生产力的用量</div>
              <button 
                className={`${styles.actionBtn} ${styles.btnDark}`}
                onClick={() => onSelectPlan('pro', billingCycle)}
              >
                升级
              </button>
              <ul className={styles.featuresList}>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><ClockIcon /></div>
                  300 每日刷新积分
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><StarIcon /></div>
                  40,000 月度积分 <span className={styles.infoIcon}><InfoIcon /></span>
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><FileTextIcon /></div>
                  大规模任务的深度研究
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><LayoutIcon /></div>
                  具备数据分析的专业网站
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><PresentationIcon /></div>
                  批量产出的分析型幻灯片
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><GlobeIcon /></div>
                  持续高负载的广度研究
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><BeakerIcon /></div>
                  抢先体验 Beta 功能
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><ListIcon /></div>
                  20 个并发任务
                </li>
                <li className={styles.featureItem}>
                  <div className={styles.featureIcon}><CalendarIcon /></div>
                  20 个定时任务
                </li>
              </ul>
            </div>
          </div>

          {/* Team Banner */}
          <div className={styles.teamBanner}>
            <div className={styles.teamInfo}>
              <div className={styles.teamIcon}>
                <BuildingIcon />
              </div>
              <div className={styles.teamText}>
                <h4>Team</h4>
                <p>用 Manus 提升您的团队生产力</p>
              </div>
            </div>
            <button className={styles.teamBtn}>获取团队版</button>
          </div>

          {/* Security Banner */}
          <div className={styles.securityBanner}>
            <div className={styles.securityLeft}>
              <div className={styles.logos}>
                 {/* Placeholder for security logos - using simple circles/rects or SVG paths if detailed */}
                 <div style={{ border: '1px solid #ddd', padding: '2px 4px', fontSize: '10px', borderRadius: '4px' }}>AICPA SOC 2</div>
                 <div style={{ border: '1px solid #ddd', padding: '2px 4px', fontSize: '10px', borderRadius: '4px' }}>GDPR</div>
                 <div style={{ border: '1px solid #ddd', padding: '2px 4px', fontSize: '10px', borderRadius: '4px' }}>ISO 27001</div>
              </div>
              <div className={styles.securityText}>
                <h4>安全与合规</h4>
                <p>企业级安全和行业标准认证。</p>
              </div>
            </div>
            <button className={styles.teamBtn} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              了解更多 <ArrowUpRightIcon />
            </button>
          </div>

          <div className={styles.footer}>
            遇到问题了吗？<span className={styles.link}>前往帮助中心</span>。
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
