'use client';

import { Truck, Package, Clock, Shield } from 'lucide-react';
import { ShippingInfo as ShippingInfoType } from '@prisma/client';

interface ShippingInfoProps {
  shipping: ShippingInfoType & {
    product?: {
      title: string;
    };
  };
}

export function ShippingInfo({ shipping }: ShippingInfoProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Truck className="h-5 w-5" />
        配送信息
      </h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">配送方式：</span>
          <span className="font-medium">{shipping.shippingMethod || '直邮'}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">预计时效：</span>
          <span className="font-medium">{shipping.estimatedDays || shipping.shippingTime || '7-14天'}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">配送费用：</span>
          <span className="font-medium">
            {shipping.shippingFee > 0 ? `¥${shipping.shippingFee}` : '免费'}
          </span>
          {shipping.freeShippingThreshold && (
            <span className="text-xs text-green-600">
              满¥{shipping.freeShippingThreshold}免运费
            </span>
          )}
        </div>
      </div>
      
      <div className="pt-3 border-t text-xs text-muted-foreground">
        <p>• 支持正品验真</p>
        <p>• 包含国际物流与清关服务</p>
        <p>• 配送时间受海关清关影响</p>
      </div>
    </div>
  );
}