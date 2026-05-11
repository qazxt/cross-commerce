"use client";

import { Bell, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  userName?: string;
  userEmail?: string;
}

export default function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-lg font-semibold text-gray-900">后台管理系统</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{userName || "管理员"}</p>
              <p className="text-xs text-gray-500">{userEmail || "admin@findsindex.com"}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
