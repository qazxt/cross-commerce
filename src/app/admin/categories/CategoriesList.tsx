"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  level: number;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}

export default function CategoriesList({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [deleting, setDeleting] = useState<string | null>(null);

  const tree: any[] = [];
  const map = new Map();
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });
  categories.forEach((cat) => {
    const node = map.get(cat.id);
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId).children.push(node);
    } else {
      tree.push(node);
    }
  });

  async function handleDelete(cat: Category) {
    if (!confirm(`确定删除分类 "${cat.name}" 吗？`)) return;
    setDeleting(cat.id);
    try {
      const res = await fetch(`/admin/api/categories?id=${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      } else {
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误，删除失败");
    } finally {
      setDeleting(null);
    }
  }

  function renderCategory(cat: any, depth = 0) {
    return (
      <div key={cat.id}>
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group" style={{ paddingLeft: `${16 + depth * 24}px` }}>
          {cat.children.length > 0 && (<span className="text-gray-300">└</span>)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{cat.name}</span>
              {cat.nameEn && (<span className="text-xs text-gray-400">{cat.nameEn}</span>)}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">L{cat.level}</span>
              {cat.isActive ? (<span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">激活</span>) : (<span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">未激活</span>)}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{cat.slug}</p>
          </div>
          <div className="text-sm text-gray-500 mr-2">{cat._count.products} 个商品</div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/admin/categories/edit?id=${cat.id}`} className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
            <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {cat.children.map((child: any) => renderCategory(child, depth + 1))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
          <p className="text-gray-500 mt-1">共 {categories.length} 个分类</p>
        </div>
        <Link href="/admin/categories/create" className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          添加分类
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-4 text-xs font-medium text-gray-500 uppercase">
          <span className="flex-1">分类名称</span>
          <span className="w-20 text-right">商品数</span>
          <span className="w-20">操作</span>
        </div>
        <div className="divide-y divide-gray-50">
          {tree.map((cat) => renderCategory(cat))}
          {tree.length === 0 && (<div className="p-8 text-center text-gray-400">暂无分类，点击"添加分类"开始</div>)}
        </div>
      </div>
    </div>
  );
}
