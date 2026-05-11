"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  nameCn?: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  _count: { products: number };
}

export default function BrandsList({ brands: initialBrands }: { brands: Brand[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(brand: Brand) {
    if (!confirm(`确定删除品牌 "${brand.name}" 吗？`)) return;
    setDeleting(brand.id);
    try {
      const res = await fetch(`/admin/api/brands?id=${brand.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setBrands((prev) => prev.filter((b) => b.id !== brand.id));
      } else {
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误，删除失败");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">品牌管理</h1>
          <p className="text-gray-500 mt-1">共 {brands.length} 个品牌</p>
        </div>
        <Link
          href="/admin/brands/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          添加品牌
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                  {brand.nameCn && (
                    <p className="text-sm text-gray-500">{brand.nameCn}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/admin/brands/edit?id=${brand.id}`}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(brand)}
                  disabled={deleting === brand.id}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {brand.description && (
              <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                {brand.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm">
                <span className="text-gray-400">商品数</span>
                <span className="ml-1 font-medium text-gray-900">
                  {brand._count.products}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Slug</span>
                <span className="ml-1 font-mono text-xs text-gray-600">
                  {brand.slug}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">暂无品牌，点击"添加品牌"开始</p>
        </div>
      )}
    </div>
  );
}
