import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Package,
  Tags,
  Award,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Eye,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "仪表盘 - 后台管理",
};

async function getDashboardData() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/admin/dashboard");

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const [
    productCount,
    categoryCount,
    brandCount,
    totalClicks,
    products,
    recentClicks,
    totalViews,
    featuredCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.userBehavior.count(),
    prisma.product.findMany({
      take: 5,
      orderBy: { viewCount: "desc" },
      include: { brand: true, primaryCategory: true },
    }),
    prisma.userBehavior.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.aggregate({ _sum: { viewCount: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
  ]);

  const todayClicks = await prisma.userBehavior.count({
    where: { createdAt: { gte: now } },
  });

  return {
    productCount,
    categoryCount,
    brandCount,
    totalClicks,
    todayClicks,
    totalViews: totalViews._sum.viewCount || 0,
    featuredCount,
    products,
    recentClicks,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const stats = [
    { label: "商品总数", value: data.productCount, icon: Package, color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600" },
    { label: "分类数", value: data.categoryCount, icon: Tags, color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600" },
    { label: "品牌数", value: data.brandCount, icon: Award, color: "bg-green-500", lightColor: "bg-green-50", textColor: "text-green-600" },
    { label: "今日点击", value: data.todayClicks, icon: MousePointerClick, color: "bg-orange-500", lightColor: "bg-orange-50", textColor: "text-orange-600" },
    { label: "总浏览量", value: data.totalViews, icon: Eye, color: "bg-cyan-500", lightColor: "bg-cyan-50", textColor: "text-cyan-600" },
    { label: "精选商品", value: data.featuredCount, icon: TrendingUp, color: "bg-yellow-500", lightColor: "bg-yellow-50", textColor: "text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">{format(new Date(), "yyyy年M月d日", { locale: zhCN })} 数据概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.lightColor} p-3 rounded-xl`}><Icon className={`w-6 h-6 ${stat.textColor}`} /></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">热门商品</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">查看全部</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <img src={product.mainImage} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500">{product.brand.name} · {product.primaryCategory.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">¥{product.priceMin}</p>
                  <p className="text-xs text-gray-500">{product.viewCount} 浏览</p>
                </div>
              </div>
            ))}
            {data.products.length === 0 && (<div className="p-8 text-center text-gray-400">暂无商品数据</div>)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100"><h2 className="font-semibold text-gray-900">快捷操作</h2></div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <Link href="/admin/products/create" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors group">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors"><Package className="w-5 h-5 text-blue-600" /></div>
              <span className="text-sm font-medium text-gray-700">添加商品</span>
            </Link>
            <Link href="/admin/categories" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors group">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors"><Tags className="w-5 h-5 text-purple-600" /></div>
              <span className="text-sm font-medium text-gray-700">管理分类</span>
            </Link>
            <Link href="/admin/brands" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors group">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors"><Award className="w-5 h-5 text-green-600" /></div>
              <span className="text-sm font-medium text-gray-700">管理品牌</span>
            </Link>
            <Link href="/admin/affiliate" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors group">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors"><Link2 className="w-5 h-5 text-orange-600" /></div>
              <span className="text-sm font-medium text-gray-700">联盟链接</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100"><h2 className="font-semibold text-gray-900">最近活动</h2></div>
        <div className="divide-y divide-gray-100">
          {data.recentClicks.map((click) => (
            <div key={click.id} className="flex items-center gap-3 p-4">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <div className="flex-1">
                <p className="text-sm text-gray-700"><span className="font-medium">{click.type}</span> → {click.targetType}: {click.targetId}</p>
              </div>
              <p className="text-xs text-gray-400">{format(click.createdAt, "MM-dd HH:mm")}</p>
            </div>
          ))}
          {data.recentClicks.length === 0 && (<div className="p-8 text-center text-gray-400">暂无活动记录</div>)}
        </div>
      </div>
    </div>
  );
}

import { Link2 } from "lucide-react";
