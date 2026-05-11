'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface SearchProps {
  initialQuery?: string;
  placeholder?: string;
}

export default function SearchBar({ initialQuery = '', placeholder }: SearchProps) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<'keyword' | 'vector' | 'hybrid'>('hybrid');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      // 使用向量搜索 API
      const response = await fetch(`/api/search/vector?q=${encodeURIComponent(query)}&mode=${mode}`);
      const data = await response.json();
      
      // 跳转到搜索结果页
      router.push(`/search?q=${encodeURIComponent(query)}&mode=${mode}`);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to keyword search
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } finally {
      setIsSearching(false);
    }
  };

  // 实时搜索建议
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search/vector?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.products || []);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder || t('search.placeholder', 'Search products...')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          
          {/* 搜索模式切换 */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="px-2 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
            title="Search mode"
          >
            <option value="keyword">🔍 关键词</option>
            <option value="hybrid">✨ 混合</option>
            <option value="vector">🧠 向量</option>
          </select>

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? '🔎...' : '🔍'}
          </button>
        </div>
      </form>

      {/* 搜索建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((product) => (
            <a
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <img
                src={product.mainImage}
                alt={product.title}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {product.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.brand?.name} · ¥{product.priceMin}
                </p>
              </div>
              {product._score && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {(product._score * 100).toFixed(0)}% match
                </span>
              )}
            </a>
          ))}
        </div>
      )}

      {/* 搜索模式说明 */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {mode === 'keyword' && '📝 传统关键词匹配'}
        {mode === 'hybrid' && '⚡ 关键词 + 语义理解（推荐）'}
        {mode === 'vector' && '🧠 纯语义搜索，理解你的意图'}
      </div>
    </div>
  );
}
