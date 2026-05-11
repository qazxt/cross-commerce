"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  level: number;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  coverImage?: string;
}

export default function EditCategoryForm({
  category,
  categories,
}: {
  category: Category;
  categories: Category[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: category.id,
      name: formData.get("name"),
      nameEn: formData.get("nameEn") || null,
      slug: formData.get("slug"),
      level: Number(formData.get("level")) || 0,
      parentId: (formData.get("parentId") as string) || null,
      sortOrder: Number(formData.get("sortOrder")) || 0,
      isActive: formData.get("isActive") === "on",
      coverImage: (formData.get("coverImage") as string) || null,
    };

    try {
      const res = await fetch("/admin/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/categories");
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
        <Link
          href="/admin/categories"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">编辑分类</h1>
          <p className="text-gray-500 mt-1">{category.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">基本信息</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  分类名称 <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={category.name}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  英文名称
                </label>
                <input
                  name="nameEn"
                  type="text"
                  defaultValue={category.nameEn || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  name="slug"
                  type="text"
                  required
                  defaultValue={category.slug}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  封面图 URL
                </label>
                <input
                  name="coverImage"
                  type="url"
                  defaultValue={category.coverImage || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">设置</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  父分类
                </label>
                <select
                  name="parentId"
                  defaultValue={category.parentId || ""}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">无（顶级分类）</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.nameEn ? `(${cat.nameEn})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  层级
                </label>
                <input
                  name="level"
                  type="number"
                  min="0"
                  defaultValue={category.level}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  排序
                </label>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={category.sortOrder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={category.isActive}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">激活分类</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "保存中..." : "保存修改"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
