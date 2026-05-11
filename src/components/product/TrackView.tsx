'use client';

import { useEffect } from 'react';

interface TrackViewProps {
  productId: string;
}

export function TrackView({ productId }: TrackViewProps) {
  useEffect(() => {
    // 记录浏览历史
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    }).catch(console.error);
  }, [productId]);

  return null;
}
