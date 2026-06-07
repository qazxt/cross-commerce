'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const router = useRouter();
  const session = null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 避免水合问题
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !session) {
      setLoading(false);
      return;
    }
    checkFavorite();
  }, [mounted, session, productId]);

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
      disabled={loading || !mounted}
      className={`${isFavorite ? 'text-red-500 hover:text-red-500' : ''} ${className || ''}`}
    >
      <Heart
        className="w-5 h-5"
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </Button>
  );
}
