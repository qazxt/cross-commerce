export default function PlatformsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">代购平台管理</h1>
          <p className="text-muted-foreground">管理代购平台配置</p>
        </div>
        <a
          href="/admin/platforms/create"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          添加平台
        </a>
      </div>

      <div className="p-12 text-center text-gray-400">平台管理功能开发中...</div>
    </div>
  );
}