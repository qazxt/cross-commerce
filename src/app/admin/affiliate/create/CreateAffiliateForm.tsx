"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  brand: { name: string };
}

const PLATFORMS = ["Kakobuy", "CNFans", "ACBuy", "Sugargoo", "Superbuy", "Pandabuy", "Wegobuy", "CSSBuy", "Ytaopal", "8Buy"];

export default function CreateAffiliateForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      productId: formData.get("productId"),
      platform: formData.get("platform"),
      platformUrl: formData.get("platformUrl"),
      affiliateUrl: formData.get("affiliateUrl"),
      isPrimary: formData.get("isPrimary") === "on",
      isActive: formData.get("isActive") === "on",
    };

    try {
      const res = await fetch("/admin/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/affiliate");
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
        <Link href="/admin/affiliate" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">添加联盟链接</h1>
          <p className="text-gray-500 mt-1">为商品添加代购平台链接</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">链接信息</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">选择商品 <span className="text-red-500">*</span></label>
                <select name="productId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">选择商品</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.brand.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">平台 <span className="text-red-500">*</span></label>
                <select name="platform" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">选择平台</option>
                  {PLATFORMS.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联盟链接 URL <span className="text-red-500">*</span></label>
                <input name="affiliateUrl" type="url" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://..." />
                <p className="text-xs text-gray-400 mt-1">带 affiliate ID 的代购平台商品页链接</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">货源链接 URL</label>
                <input name="platformUrl" type="url" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://... (1688/微店等)" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">设置</h2>

              <label className="flex items-center gap-2 cursor-pointer">
                <input name="isPrimary" type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <span className="text-sm text-gray-700">设为主链接</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input name="isActive" type="checkbox" defaultChecked className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <span className="text-sm text-gray-700">激活链接</span>
              </label>

              <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "创建中..." : "创建链接"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
