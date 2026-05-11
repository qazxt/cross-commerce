# 部署指南

## 部署到 Vercel（推荐）

### 1. 准备工作

1. 创建 GitHub 仓库并推送代码
2. 注册 Vercel 账号（https://vercel.com）
3. 创建 Supabase 项目（https://supabase.com）或使用其他 PostgreSQL 服务

### 2. 配置数据库

在 Supabase 中：

1. 创建新项目
2. 获取数据库连接字符串（Settings → Database）
3. 格式：`postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`

### 3. 部署到 Vercel

1. 登录 Vercel
2. 点击 "Add New Project"
3. 导入 GitHub 仓库
4. 配置环境变量：
   - `DATABASE_URL` - 数据库连接
   - `NEXT_PUBLIC_SITE_URL` - 你的域名
   - `AFFILIATE_KAKOBUY_ID` - Kakobuy affiliate ID
   - `AFFILIATE_CNFANS_ID` - CNFans affiliate ID
   - `AFFILIATE_ACBUY_ID` - ACBuy affiliate ID

5. 点击 "Deploy"

### 4. 部署后操作

部署完成后：

```bash
# 在 Vercel 中运行以下命令（通过 Vercel CLI）
vercel env pull          # 拉取环境变量
vercel --prod            # 生产部署

# 初始化数据库
vercel env pull
npx prisma generate
npx prisma db push
```

---

## 自定义域名

1. 在 Vercel 项目设置中添加域名
2. 在域名服务商处配置 DNS：
   - 类型：CNAME
   - 名称：@ 或 www
   - 值：cname.vercel-dns.com

3. 等待 SSL 证书生效（通常几分钟到几小时）

---

## 数据导入

### 方式 1：使用爬取脚本

```bash
# 安装 Python 依赖
pip install requests beautifulsoup4

# 运行爬取脚本
python scripts/scrape-findsindex.py

# 数据会保存到 data/scraped/ 目录
```

### 方式 2：手动导入 JSON

```bash
# 创建种子数据文件
# prisma/seed.ts

# 运行种子脚本
npm run db:seed
```

### 方式 3：使用 Prisma Studio

```bash
# 打开 Prisma Studio
npx prisma studio

# 手动添加/导入数据
```

---

## 性能优化

### 图片优化

1. 使用 Next.js Image 组件（已配置）
2. 配置图片 CDN（可选）
3. 启用图片懒加载

### 缓存策略

1. 启用 Vercel 缓存
2. 配置 ISR（增量静态再生成）
3. 使用 Redis 缓存热门数据（可选）

### 数据库优化

1. 添加索引（已在 schema 中配置）
2. 使用连接池
3. 定期清理旧数据

---

## 监控和日志

### Vercel 内置监控

- 访问 https://vercel.com/dashboard
- 查看部署日志
- 监控性能指标

### 错误监控（可选）

1. 注册 Sentry（https://sentry.io）
2. 安装 Sentry SDK：
   ```bash
   npm install @sentry/nextjs
   ```
3. 配置 `sentry.config.js`
4. 添加环境变量 `SENTRY_DSN`

---

## 备份策略

### 数据库备份

如果使用 Supabase：

1. 自动备份已启用（Pro 计划）
2. 手动备份：Settings → Database → Backups

### 代码备份

1. 定期推送到 GitHub
2. 启用 GitHub 备份

---

## 故障排查

### 常见问题

**1. 数据库连接失败**

```bash
# 检查 DATABASE_URL 是否正确
echo $DATABASE_URL

# 测试连接
npx prisma db pull
```

**2. 构建失败**

```bash
# 本地测试构建
npm run build

# 查看详细错误日志
vercel --debug
```

**3. 图片不显示**

- 检查图片 URL 是否可访问
- 配置 `next.config.js` 中的 `images.domains`

**4. SEO 不生效**

- 确保使用 SSR/SSG
- 检查 `robots.txt` 和 `sitemap.xml`
- 在 Google Search Console 提交站点

---

## 安全建议

1. **环境变量**：不要提交 `.env` 文件到 Git
2. **数据库**：使用强密码，限制 IP 访问
3. **HTTPS**：Vercel 默认启用
4. **CORS**：配置 API 路由的 CORS 策略
5. **速率限制**：对 API 添加速率限制（可选）

---

## 成本估算

### Vercel

- Hobby: 免费（适合个人项目）
- Pro: $20/月（适合商业项目）

### Supabase

- Free: 免费（500MB 数据库，足够初期使用）
- Pro: $25/月（更大容量）

### 域名

- .com: ~$10-15/年

**总计**: 初期可以完全免费，规模化后约 $35-50/月

---

**最后更新**: 2026 年 4 月 12 日
