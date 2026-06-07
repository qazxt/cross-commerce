'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, CheckCircle } from 'lucide-react';
import { getPlatformConfig } from '@/lib/platform-config';
import { AffiliateLink } from '@prisma/client';
import { formatPrice } from '@/lib/utils';

interface PlatformCompareProps {
  affiliateLinks: AffiliateLink[];
  productPrice: number;
  currency: string;
}

// 固定的平台数据配置（避免随机数导致的水合问题）
const PLATFORM_FIXED_DATA: Record<string, {
  shippingTime: string;
  shippingFee: number;
  reliability: string;
  features: { name: string; available: boolean }[];
}> = {
  'Kakobuy': {
    shippingTime: '7-10 天',
    shippingFee: 0,
    reliability: '4.8',
    features: [
      { name: '正品保证', available: true },
      { name: '包税', available: true },
      { name: '闪电发货', available: true },
      { name: '售后保障', available: true },
    ],
  },
  'CNFans': {
    shippingTime: '10-14 天',
    shippingFee: 15,
    reliability: '4.5',
    features: [
      { name: '正品保证', available: true },
      { name: '包税', available: true },
      { name: '闪电发货', available: false },
      { name: '售后保障', available: true },
    ],
  },
  'Kakobuy': {
    shippingTime: '14-21 天',
    shippingFee: 25,
    reliability: '4.2',
    features: [
      { name: '正品保证', available: true },
      { name: '包税', available: false },
      { name: '闪电发货', available: true },
      { name: '售后保障', available: true },
    ],
  },
  'default': {
    shippingTime: '10-14 天',
    shippingFee: 15,
    reliability: '4.5',
    features: [
      { name: '正品保证', available: true },
      { name: '包税', available: true },
      { name: '闪电发货', available: false },
      { name: '售后保障', available: true },
    ],
  },
};

export function PlatformCompare({ affiliateLinks, productPrice, currency }: PlatformCompareProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSelectedPlatform(
      affiliateLinks.find(l => l.isPrimary)?.platform || affiliateLinks[0]?.platform
    );
  }, [affiliateLinks]);

  // 使用固定的平台数据（基于平台名查找）
  const platformData = affiliateLinks.map(link => {
    const config = getPlatformConfig(link.platform);
    const fixedData = PLATFORM_FIXED_DATA[link.platform] || PLATFORM_FIXED_DATA['default'];
    const serviceFee = Math.round(productPrice * 0.03);
    
    return {
      platform: link.platform,
      platformName: config?.logoText || link.platform,
      color: config?.color || '#666',
      price: productPrice + serviceFee,
      originalPrice: productPrice,
      serviceFee,
      shippingTime: fixedData.shippingTime,
      shippingFee: fixedData.shippingFee,
      freeShippingThreshold: 499,
      reliability: fixedData.reliability,
      features: fixedData.features,
    };
  });

  if (affiliateLinks.length === 0 || !mounted) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Truck className="h-5 w-5" />
        平台对比
      </h3>

      <Tabs value={selectedPlatform || ''} onValueChange={setSelectedPlatform}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {platformData.map((data) => (
            <TabsTrigger
              key={data.platform}
              value={data.platform}
              className="min-w-[100px]"
              style={{
                borderColor: selectedPlatform === data.platform ? data.color : 'transparent'
              }}
            >
              <span style={{ color: data.color }}>{data.platformName}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {platformData.map((data) => (
          <TabsContent key={data.platform} value={data.platform} className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">商品价格</span>
                  <Badge variant="outline" style={{ borderColor: data.color, color: data.color }}>
                    评分 {data.reliability}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: data.color }}>
                    {formatPrice(data.price, currency)}
                  </span>
                  {data.price < data.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(data.originalPrice, currency)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  服务费：{formatPrice(data.serviceFee, currency)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    配送时效
                  </span>
                  <span className="text-sm font-medium">{data.shippingTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    配送费用
                  </span>
                  <span className="text-sm font-medium">
                    {data.shippingFee === 0 ? (
                      <span className="text-green-600">免费</span>
                    ) : (
                      formatPrice(data.shippingFee, currency)
                    )}
                  </span>
                </div>
                {data.shippingFee > 0 && data.freeShippingThreshold && (
                  <div className="text-xs text-green-600">
                    满 {formatPrice(data.freeShippingThreshold, currency)} 免运费
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-2">服务保障</div>
                <div className="grid grid-cols-2 gap-2">
                  {data.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${feature.available ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={feature.available ? '' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <a
              href={affiliateLinks.find(l => l.platform === data.platform)?.affiliateUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: data.color }}
            >
              在 {data.platformName} 购买
            </a>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
