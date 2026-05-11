'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { History, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product/ProductGrid';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  targetId: string;
  createdAt: string;
  product: any;
}

export default function HistoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/history?limit=50');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('加载浏览历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('确定要清除所有浏览历史吗？')) return;

    setClearing(true);
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch (error) {
      console.error('清除浏览历史失败:', error);
    } finally {
      setClearing(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await fetch(`/api/history?productId=${productId}`, { method: 'DELETE' });
      setHistory(history.filter(h => h.targetId !== productId));
    } catch (error) {
      console.error('删除记录失败:', error);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">浏览历史</h1>
              <p className="text-muted-foreground">
                您已浏览 {history.length} 个商品
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={clearing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清除历史
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-6">
          <ProductGrid products={history.map(h => h.product)} />
          
          {/* 移除单个商品按钮 */}
          <div className="flex flex-wrap gap-2">
            {history.map(h => (
              <Button
                key={h.id}
                variant="outline"
                size="sm"
                onClick={() => handleRemoveItem(h.targetId)}
              >
                移除 {h.product?.title?.slice(0, 10)}...
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <History className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">暂无浏览历史</h2>
          <p className="text-muted-foreground mb-6">
            您浏览的商品会显示在这里
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/search">
                <ShoppingBag className="w-4 h-4 mr-2" />
                去逛逛
              </Link>
            </Button>
            {!session && (
              <Button variant="outline" asChild>
                <Link href="/login">
                  登录同步历史
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
