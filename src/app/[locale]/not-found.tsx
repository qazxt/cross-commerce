import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <span className="text-9xl font-bold text-gray-200">404</span>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">页面未找到</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        抱歉，您访问的页面不存在或已被移除。让我们帮您找到想要的内容。
      </p>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">
            返回首页
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">
            搜索商品
          </Link>
        </Button>
      </div>

      {/* 建议内容 */}
      <div className="mt-16 w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">热门搜索</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link 
            href="/search?q=Nike" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Nike
          </Link>
          <Link 
            href="/search?q=Adidas" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Adidas
          </Link>
          <Link 
            href="/search?q=运动鞋" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            运动鞋
          </Link>
          <Link 
            href="/search?q= hoodie" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            卫衣
          </Link>
          <Link 
            href="/category" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            全部分类
          </Link>
        </div>
      </div>
    </div>
  );
}