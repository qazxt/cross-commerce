import Link from 'next/link';
import { db } from '@/lib/db';
import { CategoryWithChildren } from '@/lib/types';

async function getRootCategories(): Promise<CategoryWithChildren[]> {
  try {
    const categories = await db.category.findMany({
      where: {
        level: 0,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: 8,
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {categories.map((category) => (
        <div key={category.id} className="space-y-3">
          <Link
            href={`/category/${category.slug}`}
            className="block"
          >
            <div className="flex items-center gap-3">
              {category.coverImage && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={category.coverImage}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-sm">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {category.productCount} 个商品
                </p>
              </div>
            </div>
          </Link>
          
          {category.children && category.children.length > 0 && (
            <ul className="space-y-1 ml-3">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/category/${child.slug}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors block"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
