import { prisma } from "@/lib/db";
import { Settings, Globe, Shield, Database, Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export const metadata = { title: "设置 - 后台管理" };

async function getStats() {
  const [productCount, categoryCount, brandCount, linkCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.affiliateLink.count(),
  ]);

  const dbSize = await prisma.$queryRaw`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()` as Array<{ size: bigint }>;

  return { productCount, categoryCount, brandCount, linkCount, dbSize: Number(dbSize[0]?.size || 0) };
}

export default async function SettingsPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">系统配置与管理</p>
      </div>

      {/* Site Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-blue-600" /></div>
          <h2 className="font-semibold text-gray-900">站点信息</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">商品</p><p className="text-xl font-bold">{stats.productCount}</p></div>
          <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">分类</p><p className="text-xl font-bold">{stats.categoryCount}</p></div>
          <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">品牌</p><p className="text-xl font-bold">{stats.brandCount}</p></div>
          <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">联盟链接</p><p className="text-xl font-bold">{stats.linkCount}</p></div>
        </div>
      </div>

      {/* Database */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Database className="w-5 h-5 text-purple-600" /></div>
          <h2 className="font-semibold text-gray-900">数据库</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">SQLite 数据库</p>
              <p className="text-xs text-gray-400">{(stats.dbSize / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><Download className="w-3.5 h-3.5" />导出</button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"><RefreshCw className="w-3.5 h-3.5" />刷新统计</button>
            </div>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"><Settings className="w-5 h-5 text-gray-600" /></div>
          <h2 className="font-semibold text-gray-900">系统信息</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">框架</span><span className="font-medium">Next.js 14</span></div>
          <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">数据库</span><span className="font-medium">SQLite + Prisma</span></div>
          <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">UI</span><span className="font-medium">Tailwind CSS + shadcn/ui</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-500">更新时间</span><span className="font-medium">{format(new Date(), "yyyy-MM-dd HH:mm", { locale: zhCN })}</span></div>
        </div>
      </div>
    </div>
  );
}
