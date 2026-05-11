import { prisma } from "@/lib/db";
import { BarChart3, TrendingUp, MousePointerClick, DollarSign, Eye, Calendar } from "lucide-react";
import { format, subDays } from "date-fns";
import { zhCN } from "date-fns/locale";

export const metadata = { title: "数据统计 - 后台管理" };

async function getAnalyticsData() {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);

  const [totalClicks, todayClicks, weekClicks, monthClicks, totalViews] = await Promise.all([
    prisma.userBehavior.count(),
    prisma.userBehavior.count({ where: { createdAt: { gte: new Date(now.toDateString()) } } }),
    prisma.userBehavior.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.userBehavior.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.product.aggregate({ _sum: { viewCount: true } }),
  ]);

  const topProducts = await prisma.product.findMany({
    take: 10,
    orderBy: { viewCount: "desc" },
    include: { brand: true, primaryCategory: true },
  });

  const topPlatforms = await prisma.affiliateLink.findMany({
    orderBy: { clickCount: "desc" },
    take: 10,
  });

  // Daily clicks for last 7 days
  const dailyClicks = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const start = new Date(date.toDateString());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const count = await prisma.userBehavior.count({
      where: { createdAt: { gte: start, lt: end } },
    });
    dailyClicks.push({
      date: format(date, "MM/dd", { locale: zhCN }),
      count,
    });
  }

  return {
    totalClicks,
    todayClicks,
    weekClicks,
    monthClicks,
    totalViews: totalViews._sum.viewCount || 0,
    topProducts,
    topPlatforms,
    dailyClicks,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  const maxClicks = Math.max(...data.dailyClicks.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
        <p className="text-gray-500 mt-1">数据分析与报表</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><MousePointerClick className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">今日点击</p><p className="text-2xl font-bold text-gray-900">{data.todayClicks}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">7 天点击</p><p className="text-2xl font-bold text-gray-900">{data.weekClicks}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">总点击</p><p className="text-2xl font-bold text-gray-900">{data.totalClicks}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><Eye className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-sm text-gray-500">总浏览</p><p className="text-2xl font-bold text-gray-900">{data.totalViews}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Clicks Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">近 7 天点击趋势</h2>
          </div>
          <div className="flex items-end gap-3 h-40">
            {data.dailyClicks.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-primary/10 rounded-t-sm relative" style={{ height: `${(day.count / maxClicks) * 100}%`, minHeight: day.count > 0 ? "4px" : "0" }}>
                  {day.count > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">{day.count}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">热门商品 TOP 10</h2>
          <div className="space-y-3">
            {data.topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">{i + 1}</span>
                <img src={product.mainImage} alt={product.title} className="w-8 h-8 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                  <p className="text-xs text-gray-400">{product.brand.name}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">{product.viewCount}</span>
              </div>
            ))}
            {data.topProducts.length === 0 && (<p className="text-center text-gray-400 py-8">暂无数据</p>)}
          </div>
        </div>
      </div>

      {/* Platform Clicks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">平台点击排行</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">平台</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">点击数</th>
              </tr>
            </thead>
            <tbody>
              {data.topPlatforms.map((link) => (
                <tr key={link.id} className="border-b border-gray-50">
                  <td className="py-2 px-3 text-sm text-gray-700">{link.platform}</td>
                  <td className="py-2 px-3 text-sm text-right font-medium">{link.clickCount}</td>
                </tr>
              ))}
              {data.topPlatforms.length === 0 && (<tr><td colSpan={2} className="py-8 text-center text-gray-400">暂无数据</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
