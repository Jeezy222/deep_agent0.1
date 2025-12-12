import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../../styles/create.module.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStart = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await router.push('/chat')
    } catch (error) {
      console.error('Navigation failed:', error)
      alert('跳转失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className={styles.headerWrap}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}> 
          <Link href="/" className={styles.logoLink}>
            <img src="/brand/agent-logo.svg" alt="Agent Platform Logo" className={styles.logoImg} />
          </Link>
          <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
            <Link href="/features" className={styles.navItem}>功能</Link>
            <Link href="/pricing" className={styles.navItem}>定价</Link>
          </nav>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.actionsDesktop}>
            <button className={styles.navBtnSecondary}>注册</button>
            <button 
              className={styles.navBtnPrimary} 
              onClick={handleStart}
              disabled={isLoading}
              style={{
                border: 'none',
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {isLoading ? '加载中...' : '开始体验'}
            </button>
          </div>
          <button className={styles.menuBtn} aria-label="Toggle menu" onClick={() => setOpen(!open)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.menuIcon}>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
