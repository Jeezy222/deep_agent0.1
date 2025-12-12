import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/chat.module.css'; // Reuse chat styles for consistency

interface SearchOverlayProps {
  onClose: () => void;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load history from localStorage (7 days expiry check could be added here)
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error('Failed to parse search history');
      }
    }
    inputRef.current?.focus();
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    // Simulate API search
    setTimeout(() => {
      const newResults = [
        { id: 1, title: `关于 "${searchQuery}" 的研究报告`, type: 'doc' },
        { id: 2, title: `任务: ${searchQuery} 的执行计划`, type: 'task' },
        { id: 3, title: `代码片段: ${searchQuery} 实现`, type: 'code' },
      ];
      setResults(newResults);
      setLoading(false);
      
      // Save to history
      const newItem = { id: Date.now().toString(), query: searchQuery, timestamp: Date.now() };
      const newHistory = [newItem, ...history.filter(h => h.query !== searchQuery)].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <span className="text-gray-400">🔍</span>
          <input
            ref={inputRef}
            className="flex-1 outline-none text-lg"
            placeholder="搜索任务、文档或知识库..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">ESC</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8 text-gray-400">正在搜索...</div>
          ) : results.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">搜索结果</h3>
              <div className="space-y-2">
                {results.map(res => (
                  <div key={res.id} className="p-3 hover:bg-gray-50 rounded cursor-pointer flex items-center gap-3">
                    <span className="text-xl">{res.type === 'doc' ? '📄' : res.type === 'task' ? '✅' : '💻'}</span>
                    <div>
                      <div className="font-medium text-gray-800">{res.title}</div>
                      <div className="text-xs text-gray-400">刚刚</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : query ? (
             <div className="text-center py-8 text-gray-400">按回车键搜索</div>
          ) : (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">最近搜索</h3>
              <div className="flex flex-wrap gap-2">
                {history.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => { setQuery(item.query); handleSearch(item.query); }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors"
                  >
                    {item.query}
                  </button>
                ))}
                {history.length === 0 && <div className="text-sm text-gray-400 italic">暂无搜索记录</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
