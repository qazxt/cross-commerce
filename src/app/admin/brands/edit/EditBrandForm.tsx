"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  nameCn?: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

export default function EditBrandForm({ brand }: { brand: Brand }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: brand.id,
      name: formData.get("name"),
      nameCn: formData.get("nameCn") || null,
      slug: formData.get("slug"),
      description: formData.get("description") || null,
      logoUrl: formData.get("logoUrl") || null,
    };

    try {
      const res = await fetch("/admin/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/admin/brands");
      } else {
        const err = await res.json();
        alert(err.error || "更新失败");
      }
    } catch {
      alert("网络错误，更新失败");
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
          <h1 className="text-2xl font-bold text-gray-900">编辑品牌</h1>
          <p className="text-gray-500 mt-1">{brand.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">基本信息</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌名称 <span className="text-red-500">*</span></label>
                <input name="name" type="text" required defaultValue={brand.name} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">中文名称</label>
                <input name="nameCn" type="text" defaultValue={brand.nameCn || ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug <span className="text-red-500">*</span></label>
                <input name="slug" type="text" required defaultValue={brand.slug} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌描述</label>
                <textarea name="description" rows={4} defaultValue={brand.description || ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Logo</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                <input name="logoUrl" type="url" defaultValue={brand.logoUrl || ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://..." />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "保存中..." : "保存修改"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
