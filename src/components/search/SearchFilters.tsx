'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  count?: number;
  color?: string;
}

interface SearchFiltersProps {
  categories?: FilterOption[];
  brands?: FilterOption[];
  colors?: FilterOption[];
  priceRange?: { min: number; max: number };
  totalProducts?: number;
}

export function SearchFilters({
  categories = [],
  brands = [],
  colors = [],
  priceRange = { min: 0, max: 100000 },
  totalProducts = 0,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    categories: true,
    brands: true,
    colors: true,
  });

  // 获取当前筛选值
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentColors = searchParams.get('colors')?.split(',') || [];
  const currentPriceMin = searchParams.get('priceMin') || '';
  const currentPriceMax = searchParams.get('priceMax') || '';
  const currentSort = searchParams.get('sort') || 'relevance';

  // 更新 URL 参数
  const updateFilters = useCallback((updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    
    // 重置页码
    params.delete('page');
    
    router.push(`/search?${params.toString()}`);
  }, [searchParams, router]);

  // 清除所有筛选
  const clearAllFilters = () => {
    router.push('/search');
  };

  // 计算激活的筛选数量
  const activeFilterCount = [
    currentCategory,
    currentBrand,
    ...currentColors,
    currentPriceMin,
    currentPriceMax,
  ].filter(Boolean).length;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* 筛选器头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">筛选</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8"
          >
            <X className="w-3 h-3 mr-1" />
            清除全部 ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* 价格范围 */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-medium">价格范围</h3>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-4">
            <Slider
              min={0}
              max={100000}
              step={1000}
              value={[
                Number(currentPriceMin) || priceRange.min,
                Number(currentPriceMax) || priceRange.max,
              ]}
              onValueChange={([min, max]) => {
                updateFilters({ priceMin: min, priceMax: max });
              }}
              className="mt-2"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="最低价"
                value={currentPriceMin}
                onChange={(e) => updateFilters({ priceMin: e.target.value })}
                className="h-9 flex-1"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="最高价"
                value={currentPriceMax}
                onChange={(e) => updateFilters({ priceMax: e.target.value })}
                className="h-9 flex-1"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              ¥{(Number(currentPriceMin) || 0) / 100} - ¥{(Number(currentPriceMax) || 100000) / 100}
            </div>
          </div>
        )}
      </div>

      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-medium">分类</h3>
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.categories && (
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={currentCategory === category.id}
                      onChange={() => {
                        if (currentCategory === category.id) {
                          updateFilters({ category: undefined });
                        } else {
                          updateFilters({ category: category.id });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                  </div>
                  {category.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({category.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 品牌筛选 */}
      {brands.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-medium">品牌</h3>
            {expandedSections.brands ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.brands && (
            <div className="space-y-2">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentBrand === brand.id}
                      onChange={() => {
                        if (currentBrand === brand.id) {
                          updateFilters({ brand: undefined });
                        } else {
                          updateFilters({ brand: brand.id });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      {brand.name}
                    </span>
                  </div>
                  {brand.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({brand.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 颜色筛选 */}
      {colors.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('colors')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-medium">颜色</h3>
            {expandedSections.colors ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.colors && (
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const isSelected = currentColors.includes(color.id);
                return (
                  <Badge
                    key={color.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all',
                      isSelected && 'ring-2 ring-primary/20'
                    )}
                    onClick={() => {
                      const newColors = isSelected
                        ? currentColors.filter(c => c !== color.id)
                        : [...currentColors, color.id];
                      updateFilters({ 
                        colors: newColors.length > 0 ? newColors.join(',') : undefined 
                      });
                    }}
                  >
                    {color.color && (
                      <span
                        className="w-3 h-3 rounded-full mr-1 inline-block border border-border"
                        style={{ backgroundColor: color.color }}
                      />
                    )}
                    {color.name}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 排序选项 */}
      <div>
        <h3 className="font-medium mb-3">排序</h3>
        <div className="space-y-2">
          {[
            { value: 'relevance', label: '相关性' },
            { value: 'newest', label: '最新上架' },
            { value: 'popular', label: '最受欢迎' },
            { value: 'price_asc', label: '价格从低到高' },
            { value: 'price_desc', label: '价格从高到低' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="sort"
                checked={currentSort === option.value}
                onChange={() => updateFilters({ sort: option.value })}
                className="w-4 h-4"
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
