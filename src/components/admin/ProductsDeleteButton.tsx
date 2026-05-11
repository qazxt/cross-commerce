"use client";

export function ProductsDeleteButton({ productId }: { productId: string }) {
  return (
    <button
      onClick={async () => {
        if (!confirm("确定删除此商品吗？此操作不可恢复。")) return;
        try {
          const res = await fetch(`/admin/api/products/${productId}`, { method: "DELETE" });
          if (res.ok) {
            window.location.reload();
          } else {
            const err = await res.json();
            alert(err.error || "删除失败");
          }
        } catch {
          alert("网络错误，删除失败");
        }
      }}
      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    </button>
  );
}
