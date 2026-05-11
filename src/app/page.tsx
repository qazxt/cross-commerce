export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-primary">FindsIndex Clone</h1>
          <p className="text-xl text-muted-foreground">
            商品数据库网站 - 测试版
          </p>
        </header>

        {/* Status */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-2xl font-bold">✅ 部署成功！</h2>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Next.js 14 运行中</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>SQLite 数据库已初始化</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Tailwind CSS 已配置</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Prisma ORM 已连接</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-2xl font-bold">📊 项目信息</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• 项目目录：<code className="bg-muted px-2 py-1 rounded">/workspace/findsindex-clone</code></li>
            <li>• 数据库：<code className="bg-muted px-2 py-1 rounded">prisma/dev.db</code></li>
            <li>• 文档：<code className="bg-muted px-2 py-1 rounded">README.md</code></li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-2xl font-bold">🚀 下一步</h2>
          <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
            <li>导入商品数据（运行 <code className="bg-muted px-2 py-1 rounded">python scripts/scrape-findsindex.py</code>）</li>
            <li>配置 Affiliate 链接</li>
            <li>部署到 Vercel（参考 <code className="bg-muted px-2 py-1 rounded">DEPLOYMENT.md</code>）</li>
          </ol>
        </div>

        {/* Links */}
        <div className="flex gap-4 justify-center">
          <a 
            href="/api/products" 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            测试 API
          </a>
          <a 
            href="https://www.feishu.cn/docx/UrKVdkgU2okYR7xszFdcT8qwnGc" 
            target="_blank"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            查看文档
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center text-muted-foreground pt-8 border-t">
          <p>⚠️ 免责声明：本站仅用于信息参考，不销售任何商品</p>
          <p className="mt-2">© 2026 FindsIndex Clone - Built with Next.js</p>
        </footer>
      </div>
    </div>
  );
}
