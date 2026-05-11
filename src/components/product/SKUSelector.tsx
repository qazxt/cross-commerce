'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SKUOption {
  id: string;
  name: string;
  value: string;
  type: 'color' | 'size' | 'style';
  image?: string;
}

interface ProductSKU {
  id: string;
  name: string;
  price: number;
  stock: number;
  options: Record<string, string>;
  image?: string;
  isActive: boolean;
}

interface SKUSelectorProps {
  options: {
    colors?: SKUOption[];
    sizes?: SKUOption[];
    styles?: SKUOption[];
  };
  skus: ProductSKU[];
  onSelect?: (sku: ProductSKU | null) => void;
}

export function SKUSelector({ options, skus, onSelect }: SKUSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // 查找匹配的 SKU
  const findMatchingSKU = () => {
    if (Object.keys(selectedOptions).length === 0) return null;
    
    return skus.find(sku => {
      return Object.entries(selectedOptions).every(([key, value]) => {
        return sku.options[key] === value;
      });
    }) || null;
  };

  const matchingSKU = findMatchingSKU();

  // 通知父组件 SKU 变化
  useState(() => {
    onSelect?.(matchingSKU);
  });

  // 检查选项是否可选（有库存）
  const isOptionAvailable = (optionType: string, optionValue: string) => {
    const testOptions = { ...selectedOptions, [optionType]: optionValue };
    return skus.some(sku => {
      return Object.entries(testOptions).every(([key, value]) => {
        return sku.options[key] === value;
      }) && sku.stock > 0 && sku.isActive;
    });
  };

  const handleSelect = (type: string, value: string) => {
    setSelectedOptions(prev => {
      const next = { ...prev, [type]: value };
      // 如果移除这个选项，也移除
      if (prev[type] === value) {
        const { [type]: _, ...rest } = next;
        return rest;
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* 颜色选择 */}
      {options.colors && options.colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">颜色</h3>
          <div className="flex flex-wrap gap-2">
            {options.colors.map((color) => {
              const isSelected = selectedOptions['color'] === color.value;
              const isAvailable = isOptionAvailable('color', color.value);
              
              return (
                <button
                  key={color.id}
                  onClick={() => handleSelect('color', color.value)}
                  disabled={!isAvailable}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 transition-all',
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                    !isAvailable && 'opacity-40 cursor-not-allowed'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {color.image && (
                    <img
                      src={color.image}
                      alt={color.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 尺寸选择 */}
      {options.sizes && options.sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">尺寸</h3>
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => {
              const isSelected = selectedOptions['size'] === size.value;
              const isAvailable = isOptionAvailable('size', size.value);
              
              return (
                <button
                  key={size.id}
                  onClick={() => handleSelect('size', size.value)}
                  disabled={!isAvailable}
                  className={cn(
                    'px-4 py-2 rounded-md border text-sm font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50',
                    !isAvailable && 'opacity-40 cursor-not-allowed line-through'
                  )}
                >
                  {size.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 款式选择 */}
      {options.styles && options.styles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">款式</h3>
          <div className="flex flex-wrap gap-2">
            {options.styles.map((style) => {
              const isSelected = selectedOptions['style'] === style.value;
              const isAvailable = isOptionAvailable('style', style.value);
              
              return (
                <button
                  key={style.id}
                  onClick={() => handleSelect('style', style.value)}
                  disabled={!isAvailable}
                  className={cn(
                    'px-4 py-2 rounded-md border text-sm font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50',
                    !isAvailable && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {style.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SKU 信息 */}
      {matchingSKU && (
        <div className="p-4 bg-muted rounded-lg mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">已选择：{matchingSKU.name}</p>
              <p className="text-lg font-bold text-primary mt-1">
                ¥{(matchingSKU.price / 100).toFixed(0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {matchingSKU.stock > 0 ? (
                  <span className="text-green-600">有库存</span>
                ) : (
                  <span className="text-red-600">缺货</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                库存：{matchingSKU.stock}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
