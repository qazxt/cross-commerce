'use client';

import { useEffect } from 'react';

/**
 * 生成或获取会话 ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('findsindex_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('findsindex_session_id', sessionId);
  }
  return sessionId;
}

/**
 * 追踪联盟链接点击
 * 使用 navigator.sendBeacon 确保数据可靠发送
 */
export function trackAffiliateClick(linkId: string, productId: string, platform: string) {
  const sessionId = getSessionId();
  
  const data = {
    linkId,
    productId,
    platform,
    sessionId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
  };

  // 使用 sendBeacon 确保页面跳转后数据也能发送成功
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/affiliate/click', blob);
  } else {
    // 降级方案：使用 fetch
    fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(console.error);
  }
}

/**
 * 自动追踪所有联盟链接点击
 */
export function initAffiliateTracking() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href*="affiliate"]') || target.closest('a[href*="?url="]');
      
      if (link instanceof HTMLAnchorElement) {
        const url = new URL(link.href);
        const params = new URLSearchParams(url.search);
        
        // 提取链接信息
        const platform = url.hostname.replace('www.', '').split('.')[0];
        const productId = link.getAttribute('data-product-id');
        const linkId = link.getAttribute('data-link-id');
        
        if (productId && linkId) {
          trackAffiliateClick(linkId, productId, platform);
        }
      }
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
}
