"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Copy, Trash2, Globe } from "lucide-react";

interface AffiliateLink {
  id: string;
  productId: string;
  platform: string;
  platformUrl: string;
  affiliateUrl: string;
  isActive: boolean;
  isPrimary: boolean;
  clickCount: number;
  product: {
    id: string;
    title: string;
    mainImage: string;
    brand: { name: string };
  };
}

const platformColors: Record<string, string> = {
  kakobuy: "bg-blue-50 text-blue-700",
  cnfans: "bg-green-50 text-green-700",
  superbuy: "bg-purple-50 text-purple-700",
  sugargoo: "bg-pink-50 text-pink-700",
  yoybuy: "bg-orange-50 text-orange-700",
};

export default function AffiliatePage({ links: initialLinks }: { links: AffiliateLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [deleting, setDeleting] = useState<string | null>(null);

  const byProduct = new Map<string, AffiliateLink[]>();
  links.forEach((link) => {
    if (!byProduct.has(link.productId)) {
      byProduct.set(link.productId, []);
    }
    byProduct.get(link.productId)!.push(link);
  });

  async function handleDelete(link: AffiliateLink) {
    if (!confirm(`确定删除 ${link.platform} 的联盟链接吗？`)) return;
    setDeleting(link.id);
    try {
      const res = await fetch(`/admin/api/affiliate?id=${link.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== link.id));
      } else {
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误，删除失败");
    } finally {
      setDeleting(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">联盟链接管理</h1>
          <p className="text-gray-500 mt-1">共 {links.length} 个链接</p>
        </div>
        <Link
          href="/admin/affiliate/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          添加链接
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">总链接数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{links.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">活跃链接</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{links.filter((l) => l.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">总点击数</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{links.reduce((sum, l) => sum + l.clickCount, 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">平台数</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{new Set(links.map((l) => l.platform)).size}</p>
        </div>
      </div>

      {Array.from(byProduct.entries()).map(([productId, productLinks]) => {
        const firstLink = productLinks[0];
        return (
          <div key={productId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <img src={firstLink.product.mainImage} alt={firstLink.product.title} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{firstLink.product.title}</h3>
                <p className="text-sm text-gray-500">{firstLink.product.brand.name} · {productLinks.length} 个链接</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {productLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors group">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${platformColors[link.platform.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                    {link.platform}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a href={link.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">{link.affiliateUrl}</a>
                    {link.platformUrl && (
                      <a href={link.platformUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:underline truncate block">货源: {link.platformUrl}</a>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{link.clickCount}</span>
                    {link.isPrimary && (<span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">主要</span>)}
                    {!link.isActive && (<span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">停用</span>)}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyToClipboard(link.affiliateUrl)} className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(link)} disabled={deleting === link.id} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {links.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">暂无联盟链接</p>
        </div>
      )}
    </div>
  );
}
