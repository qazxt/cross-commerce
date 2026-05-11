"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CreateProductForm({
  brands,
  categories,
}: {
  brands: Brand[];
  categories: Category[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [skus, setSkus] = useState<Array<{ name: string; price: string; stock: string; options: string }>>([
    { name: "默认", price: "", stock: "0", options: "{}" },
  ]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      title: formData.get("title"),
      titleEn: formData.get("titleEn"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      descriptionCn: formData.get("descriptionCn"),
      priceMin: parseInt(formData.get("priceMin") as string),
      priceMax: parseInt(formData.get("priceMax") as string),
      brandId: formData.get("brandId"),
      primaryCategoryId: formData.get("primaryCategoryId"),
      mainImage: formData.get("mainImage") as string,
      images: JSON.stringify(images),
      isFeatured: formData.get("isFeatured") === "on",
      status: formData.get("status") || "active",
      skus: skus.map((s) => ({
        name: s.name,
        price: s.price,
        stock: s.stock,
        options: s.options,
      })),
    };

    try {
      const res = await fetch("/admin/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        const err = await res.json();
        alert(err.error || "创建失败");
      }
    } catch {
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  }

  function addSku() {
    setSkus([...skus, { name: "", price: "", stock: "0", options: "{}" }]);
  }

  function removeSku(index: number) {
    setSkus(skus.filter((_, i) => i !== index));
  }

  function updateSku(index: number, field: string, value: string) {
    const newSkus = [...skus];
    newSkus[index] = { ...newSkus[index], [field]: value };
    setSkus(newSkus);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">添加商品</h1>
          <p className="text-gray-500 mt-1">填写商品信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">基本信息</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  商品名称 <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="输入商品名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  英文名称
                </label>
                <input
                  name="titleEn"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="English name"
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="nike-sport-tshirt"
                />
                <p className="text-xs text-gray-400 mt-1">URL 中的标识符，英文+数字+连字符</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  中文描述
                </label>
                <textarea
                  name="descriptionCn"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="详细描述商品信息..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  英文描述
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Product description..."
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">价格信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    最低价格 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="priceMin"
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="199"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    最高价格 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="priceMax"
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="249"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">图片</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  主图 URL <span className="text-red-500">*</span>
                </label>
                <input
                  name="mainImage"
                  type="url"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  附图 URL（每行一个）
                </label>
                <textarea
                  value={images.join("\n")}
                  onChange={(e) => setImages(e.target.value.split("\n").filter(Boolean))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-mono"
                  placeholder="https://...&#10;https://..."
                />
              </div>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">SKU 规格</h2>
                <button
                  type="button"
                  onClick={addSku}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  添加 SKU
                </button>
              </div>
              <div className="space-y-3">
                {skus.map((sku, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    <input
                      value={sku.name}
                      onChange={(e) => updateSku(index, "name", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="SKU 名称"
                    />
                    <input
                      value={sku.price}
                      onChange={(e) => updateSku(index, "price", e.target.value)}
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="价格"
                    />
                    <input
                      value={sku.stock}
                      onChange={(e) => updateSku(index, "stock", e.target.value)}
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="库存"
                    />
                    <button
                      type="button"
                      onClick={() => removeSku(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">发布设置</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  品牌 <span className="text-red-500">*</span>
                </label>
                <select
                  name="brandId"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">选择品牌</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  主分类 <span className="text-red-500">*</span>
                </label>
                <select
                  name="primaryCategoryId"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  状态
                </label>
                <select
                  name="status"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="active">上架</option>
                  <option value="inactive">下架</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="isFeatured"
                  type="checkbox"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">设为精选商品</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "创建中..." : "创建商品"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
