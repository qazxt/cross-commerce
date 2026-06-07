import Link from 'next/link';
import { db } from '@/lib/db';
import { CategoryWithChildren } from '@/lib/types';
import { 
  ShoppingBag, 
  Shirt, 
  Glasses, 
  Headphones, 
  Wallet, 
  Crown,
  Footprints,
  Watch,
  Gem
} from 'lucide-react';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  '服装': Shirt,
  '鞋靴': Footprints,
  '箱包': ShoppingBag,
  '配饰': Gem,
  '电子': Headphones,
  '针织帽': Crown,
  '卡包': Wallet,
  '太阳镜': Glasses,
  '卫衣': Shirt,
  '短裤': Footprints,
  '牛仔裤': Footprints,
  '运动鞋': Footprints,
};

const defaultIcon = ShoppingBag;

function getCategoryIcon(name: string) {
  return categoryIcons[name] || defaultIcon;
}

const categoryColors: Record<string, string> = {
  '服装': 'from-blue-500 to-blue-600',
  '鞋靴': 'from-red-500 to-red-600',
  '箱包': 'from-amber-500 to-amber-600',
  '配饰': 'from-purple-500 to-purple-600',
  '电子': 'from-gray-500 to-gray-600',
  '针织帽': 'from-orange-500 to-orange-600',
  '卡包': 'from-pink-500 to-pink-600',
  '太阳镜': 'from-indigo-500 to-indigo-600',
  '卫衣': 'from-green-500 to-green-600',
  '短裤': 'from-cyan-500 to-cyan-600',
  '牛仔裤': 'from-blue-600 to-blue-700',
  '运动鞋': 'from-red-500 to-red-600',
};

const defaultColor = 'from-slate-500 to-slate-600';

function getCategoryColor(name: string) {
  return categoryColors[name] || defaultColor;
}

async function getRootCategories(): Promise<CategoryWithChildren[]> {
  try {
    const categories = await db.category.findMany({
      where: {
        level: 0,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: 12,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 5,
        },
      },
    });
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function CategoryNav() {
  const categories = await getRootCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.name);
        const colorClass = getCategoryColor(category.name);
        
        return (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group"
          >
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClass} p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.03]`}>
              {/* 背景装饰 */}
              <div className="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-20 h-20" />
              </div>
              
              {/* 内容 */}
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-white mb-0.5">
                  {category.name}
                </h3>
                <p className="text-xs text-white/70">
                  {category.productCount} 件
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
