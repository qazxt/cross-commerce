"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  Link2,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "仪表盘", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "商品管理", href: "/admin/products", icon: Package },
  { label: "分类管理", href: "/admin/categories", icon: Tags },
  { label: "品牌管理", href: "/admin/brands", icon: Award },
  { label: "联盟链接", href: "/admin/affiliate", icon: Link2 },
  { label: "数据统计", href: "/admin/analytics", icon: BarChart3 },
  { label: "设置", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-lg text-gray-900">FindsIndex</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1">后台管理系统</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← 返回前台
        </Link>
      </div>
    </aside>
  );
}
