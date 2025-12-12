import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import styles from '../styles/chat.module.css'
import CreditsPopover from '../components/common/CreditsPopover'
import PaymentModal from '../components/common/PaymentModal'
import IframeModal from '../components/common/IframeModal'
import PricingModal from '../components/common/PricingModal'
import SearchOverlay from '../components/common/SearchOverlay'
import { useRouter } from 'next/router'

const ORG_ID = '1a828e4d-0360-4422-8c68-983b1e8a1c43'; // Demo Org ID

export default function ChatPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [credits, setCredits] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCreditsPopover, setShowCreditsPopover] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [detailedCredits, setDetailedCredits] = useState<any>(null)
  // const [iframeUrl, setIframeUrl] = useState('') // Deprecated for full redirect flow
  const menuRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const connectWebSocket = () => {
    if (wsRef.current) return;
    
    // In production, use wss:// and proper host
    const ws = new WebSocket(`ws://localhost:8001/ws/${ORG_ID}`);
    
    ws.onopen = () => {
        console.log('Connected to credit sync service');
    };
    
    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'credit_update') {
                console.log('Received credit update:', message.data);
                setDetailedCredits(message.data);
                // Also update legacy credits state for compatibility
                setCredits(prev => ({
                    ...prev,
                    points: message.data.total_points
                }));
            }
        } catch (e) {
            console.error('Failed to parse WS message', e);
        }
    };
    
    ws.onclose = () => {
        console.log('Credit sync disconnected, reconnecting...');
        wsRef.current = null;
        setTimeout(connectWebSocket, 3000); // Reconnect after 3s
    };
    
    wsRef.current = ws;
  };

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  useEffect(() => {
    fetchCredits()
    connectWebSocket()
    
    // Check for payment success callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
        // Show success notification (using alert for simplicity, or could use a toast)
        // setTimeout to ensure it runs after render or use a custom toast component
        // For now, console log and alert
        console.log('Payment Successful!');
        alert('✅ 支付成功！您的权益已更新。');
        
        // Clean URL
        window.history.replaceState({}, '', '/chat');
        // Refresh credits immediately
        fetchCredits();
    }

    const interval = setInterval(fetchCredits, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check for search tab
    if (router.query.tab === 'search') {
        setShowSearch(true);
    }
  }, [router.query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowCreditsPopover(false)
      }
    }
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setShowCreditsPopover(false)
        setShowPricingModal(false)
      }
    }

    if (isMenuOpen || showCreditsPopover || showPricingModal) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEsc)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isMenuOpen, showCreditsPopover, showPricingModal])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handlePaymentSuccess = () => {
    // Refresh credits after successful payment
    fetchCredits()
    // Show a toast or notification if needed
    console.log('Payment successful, credits refreshed')
  }

  const handleSelectPlan = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    setShowPricingModal(false)
    console.log(`Initiating payment for plan: ${planId}, billing: ${billingCycle}`)
    
    try {
        const res = await fetch('http://localhost:8001/api/v1/payment/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ORG_ID}` },
            body: JSON.stringify({
                planId: planId,
                provider: 'alipay',
                redirectUrl: 'http://localhost:3000/chat?payment_success=true'
            })
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            }
        } else {
            const errText = await res.text();
            console.error('Payment initiation failed:', errText);
            alert('无法启动支付会话，请稍后重试。');
        }
    } catch (e) {
        console.error('Error initiating payment:', e);
        alert('支付服务连接失败。');
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Manus - AI Agent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Search Overlay */}
      {showSearch && (
        <SearchOverlay onClose={() => {
            setShowSearch(false);
            // Clear query param
            const { tab, ...rest } = router.query;
            router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
        }} />
      )}

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handleSelectPlan}
      />

      {/* Iframe Modal - Deprecated
      {iframeUrl && (
        <IframeModal
          url={iframeUrl}
          title="支付与升级"
          onClose={() => setIframeUrl('')}
        />
      )}
      */}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.logoArea}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 8}}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Manus
        </div>

        <div className={`${styles.menuItem} ${styles.active}`}>
          <span className={styles.menuIcon}>✏️</span>
          新建任务
        </div>
        <div className={styles.menuItem} onClick={() => setShowSearch(true)}>
          <span className={styles.menuIcon}>🔍</span>
          搜索
        </div>
        <div className={styles.menuItem} onClick={() => router.push('/library')}>
          <span className={styles.menuIcon}>📚</span>
          库
        </div>

        <div style={{marginTop: 20, fontSize: 12, color: '#999', paddingLeft: 12, marginBottom: 8}}>项目</div>
        <div className={styles.menuItem}>
          <span className={styles.menuIcon}>📂</span>
          新项目
        </div>

        <div className={styles.spacer} />

        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>U</div>
          <div style={{flex: 1, fontSize: 13, fontWeight: 500}}>与好友分享 Manus</div>
          <div style={{fontSize: 12, color: '#999'}}> &gt; </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.topBadge}>🔔</div>
          <div 
            className={styles.topBadge} 
            style={{cursor: 'pointer', position: 'relative'}}
            onClick={() => setShowCreditsPopover(!showCreditsPopover)}
            ref={popoverRef}
          >
            {credits ? `资源点: ${formatNumber(credits.points)}` : '资源点: ...'}
            {detailedCredits && (
                <div style={{fontSize: '10px', color: '#888', marginTop: 2, display: 'flex', gap: 4}}>
                    <span>月度: {detailedCredits.monthly_points}</span>
                    <span>|</span>
                    <span>每日: {detailedCredits.daily_points}</span>
                </div>
            )}
            {showCreditsPopover && credits && (
              <CreditsPopover 
                points={credits.points}
                freePoints={credits.freePoints}
                dailyRefresh={credits.dailyRefresh}
                onUpgradeClick={() => {
                  setShowCreditsPopover(false)
                  setShowPricingModal(true)
                }}
              />
            )}
          </div>
          <div 
            className={styles.userAvatar} 
            style={{width: 32, height: 32, cursor: 'pointer'}}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {credits ? credits.username.substring(0, 2) : 'U'}
          </div>

          {isMenuOpen && credits && (
            <div className={styles.userMenuDropdown} ref={menuRef}>
              <div className={styles.menuHeader}>
                <div className={styles.menuAvatar}>
                    {credits.username.substring(0, 2)}
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{credits.username}</div>
                    <div className={styles.userEmail}>{credits.email}</div>
                </div>
                <div style={{opacity: 0.5}}>⇄</div>
              </div>

              <div className={styles.menuList}>
                <div className={styles.menuItem}>
                    <span className={styles.menuIcon}>💡</span>
                    知识
                </div>
                <div className={styles.menuItem}>
                    <span className={styles.menuIcon}>👤</span>
                    账户
                </div>
                <div className={styles.menuItem}>
                    <span className={styles.menuIcon}>⚙️</span>
                    设置
                </div>
                <div style={{height: 1, backgroundColor: '#eee', margin: '4px 0'}}></div>
                <div className={styles.menuItem}>
                    <span className={styles.menuIcon}>🏠</span>
                    主页
                    <div className={styles.menuSpacer}></div>
                    <span className={styles.menuArrow}>↗</span>
                </div>
                <div className={styles.menuItem}>
                    <span className={styles.menuIcon}>❓</span>
                    获取帮助
                    <div className={styles.menuSpacer}></div>
                    <span className={styles.menuArrow}>↗</span>
                </div>
                <div className={`${styles.menuItem} ${styles.logoutItem}`}>
                    <span className={styles.menuIcon}>↪️</span>
                    退出登录
                </div>
              </div>
            </div>
          )}
        </div>

        <h1 className={styles.greeting}>我能为你做什么？</h1>

        <div className={styles.inputWrapper}>
          <input 
            className={styles.input} 
            placeholder="分配一个任务或提问任何问题" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={styles.inputActions}>
            <div className={styles.actionLeft}>
              <button className={styles.actionBtn}>+</button>
              <button className={styles.actionBtn}>📎</button>
            </div>
            <button className={`${styles.actionBtn} ${styles.sendBtn} ${input ? styles.active : ''}`}>
              ↑
            </button>
          </div>
        </div>

        <div className={styles.suggestions}>
          <div className={styles.suggestionChip}>🍌 制作幻灯片</div>
          <div className={styles.suggestionChip}>📅 创建网站</div>
          <div className={styles.suggestionChip}>🔍 Wide Research</div>
          <div className={styles.suggestionChip}>更多 ↓</div>
        </div>

        <div className={styles.footerCard}>
          <div className={styles.cardIcon}>💻</div>
          <div className={styles.cardText}>
            <h4>构建您的全栈 Web 应用</h4>
            <p>构建您的第一个 AI-native 网页应用，并领取 1 万亿 LLM tokens</p>
          </div>
        </div>
      </div>
    </div>
  )
}
