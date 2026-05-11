"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateBrandForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      nameCn: formData.get("nameCn") || null,
      slug: formData.get("slug"),
      description: formData.get("description") || null,
      logoUrl: formData.get("logoUrl") || null,
    };

    try {
      const res = await fetch("/admin/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/brands");
      } else {
        const err = await res.json();
        alert(err.error || "创建失败");
      }
    } catch {
      alert("网络错误，创建失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/brands" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">添加品牌</h1>
          <p className="text-gray-500 mt-1">填写品牌信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">基本信息</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  品牌名称 <span className="text-red-500">*</span>
                </label>
                <input name="name" type="text" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="例如：Nike" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">中文名称</label>
                <input name="nameCn" type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="例如：耐克" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input name="slug" type="text" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="nike" />
                <p className="text-xs text-gray-400 mt-1">URL 中的标识符，英文+数字+连字符</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌描述</label>
                <textarea name="description" rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="品牌简介..." />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Logo</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                <input name="logoUrl" type="url" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://..." />
              </div>

              <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "创建中..." : "创建品牌"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
