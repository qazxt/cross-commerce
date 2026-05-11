'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  productId: string;
}

export function FavoriteButton({ productId }: FavoriteButtonProps) {
  const router = useRouter();
  // 暂时不使用 session，避免 SessionProvider 问题
  const session = null; // 用户未登录状态
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // 检查收藏状态
  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    checkFavorite();
  }, [session, productId]);

  const checkFavorite = async () => {
    try {
      const res = await fetch(`/api/favorites/check?productId=${productId}`);
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      if (isFavorite) {
        // 取消收藏
        await fetch(`/api/favorites?productId=${productId}`, {
          method: 'DELETE',
        });
        setIsFavorite(false);
      } else {
        // 添加收藏
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={isFavorite ? 'text-red-500 hover:text-red-500' : ''}
    >
      <Heart
        className="w-5 h-5"
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </Button>
  );
}
