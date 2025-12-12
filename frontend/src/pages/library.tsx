import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/chat.module.css';

// Mock Redux state persistence
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('library_state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('library_state', serializedState);
  } catch {
    // ignore write errors
  }
};

export default function LibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // 1. Auth Check
    // In a real app, verify JWT or session. Here we check if we can fetch credits as a proxy.
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/credits');
        if (!res.ok) {
            // Not authenticated or session expired
            console.log('Auth check failed, redirecting...');
            router.push('/'); // Redirect to landing/login
            return;
        }
        
        // 2. Load State (Redux persistence simulation)
        const savedState = loadState();
        if (savedState && savedState.lastVisited) {
            console.log(`Last visited: ${new Date(savedState.lastVisited).toLocaleString()}`);
        }
        saveState({ lastVisited: Date.now() });

        // 3. Load Data (Simulated)
        setTimeout(() => {
            setItems([
                { id: 1, title: "Q3 Financial Analysis", type: "report", date: "2023-10-01" },
                { id: 2, title: "Website Redesign Assets", type: "folder", date: "2023-09-28" },
                { id: 3, title: "Competitor Research: AI Agents", type: "research", date: "2023-09-25" },
            ]);
            setLoading(false);
        }, 800);

      } catch (e) {
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Library - Manus</title>
      </Head>

      <div className={styles.sidebar}>
         <div className={styles.logoArea} onClick={() => router.push('/chat')} style={{cursor: 'pointer'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: 8}}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Manus
        </div>
        <div className={styles.menuItem} onClick={() => router.push('/chat')}>
          <span className={styles.menuIcon}>💬</span>
          Chat
        </div>
        <div className={`${styles.menuItem} ${styles.active}`}>
          <span className={styles.menuIcon}>📚</span>
          Library
        </div>
      </div>

      <div className={styles.main} style={{padding: '40px'}}>
        <h1 className="text-3xl font-bold mb-8">My Library</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-4xl mb-4">
                        {item.type === 'folder' ? '📂' : item.type === 'report' ? '📊' : '📝'}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.date}</p>
                </div>
            ))}
            
            {/* Skeleton / Placeholder for visual balance */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                + New Collection
            </div>
        </div>
      </div>
    </div>
  );
}
