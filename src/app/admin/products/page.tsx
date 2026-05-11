import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductsDeleteButton } from "@/components/admin/ProductsDeleteButton";

export const metadata = {
  title: "商品管理 - 后台管理",
};

async function getProducts(searchParams: { q?: string; page?: string; status?: string }) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { slug: { contains: searchParams.q } },
    ];
  }
  if (searchParams.status) {
    where.status = searchParams.status;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, primaryCategory: true },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const categories = await prisma.category.findMany({
    where: { level: 0 },
    orderBy: { sortOrder: "asc" },
  });

  return { products, total, page, pageSize, categories };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; status?: string };
}) {
  const { products, total, page, pageSize, categories } = await getProducts(searchParams);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-500 mt-1">共 {total} 个商品</p>
        </div>
        <Link href="/admin/products/create" className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />
          添加商品
        </Link>
      </div>

      <form action="/admin/products" className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input type="text" name="q" defaultValue={searchParams.q} placeholder="搜索商品名称或 Slug..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <select name="status" defaultValue={searchParams.status || ""} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">全部状态</option>
            <option value="active">上架</option>
            <option value="inactive">下架</option>
          </select>
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">搜索</button>
          {(searchParams.q || searchParams.status) && (
            <Link href="/admin/products" className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">重置</Link>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">品牌</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">浏览</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.mainImage} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-400">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.brand.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.primaryCategory.name}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">¥{product.priceMin} - ¥{product.priceMax}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.viewCount}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {product.status === "active" ? "上架" : "下架"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/products/${product.id}`} className="p-1.5 text-gray-400 hover:text-primary transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></Link>
                      <ProductsDeleteButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">第 {page} 页，共 {totalPages} 页</p>
            <div className="flex gap-1">
              {page > 1 && (<Link href={`/admin/products?page=${page - 1}${searchParams.q ? `&q=${searchParams.q}` : ""}${searchParams.status ? `&status=${searchParams.status}` : ""}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">上一页</Link>)}
              {page < totalPages && (<Link href={`/admin/products?page=${page + 1}${searchParams.q ? `&q=${searchParams.q}` : ""}${searchParams.status ? `&status=${searchParams.status}` : ""}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">下一页</Link>)}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="p-12 text-center text-gray-400">暂无商品</div>
        )}
      </div>
    </div>
  );
}
