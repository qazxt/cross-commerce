# FindsIndex Clone

商品数据库网站 - 复刻 FindsIndex.com 的核心功能

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Affiliate 配置
AFFILIATE_KAKOBUY_ID="your_id"
AFFILIATE_CNFANS_ID="your_id"
AFFILIATE_ACBUY_ID="your_id"
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库结构
npm run db:push

# (可选) 导入种子数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 📁 项目结构

```
findsindex-clone/
├── prisma/
│   ├── schema.prisma          # 数据库模型
│   └── seed.ts                # 种子数据
├── src/
│   ├── app/
│   │   ├── [locale]/          # 国际化路由
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── search/        # 搜索页
│   │   │   ├── category/      # 分类页
│   │   │   ├── brand/         # 品牌页
│   │   │   ├── product/       # 商品详情页
│   │   │   └── account/       # 用户账户
│   │   └── api/               # API 路由
│   ├── components/
│   │   ├── ui/                # 基础 UI 组件
│   │   ├── layout/            # 布局组件
│   │   ├── product/           # 商品组件
│   │   ├── search/            # 搜索组件
│   │   └── category/          # 分类组件
│   ├── lib/
│   │   ├── db.ts              # 数据库连接
│   │   ├── utils.ts           # 工具函数
│   │   ├── types.ts           # 类型定义
│   │   └── constants.ts       # 常量
│   └── messages/              # 国际化文件
├── scripts/
│   └── scrape-findsindex.py   # 数据爬取脚本
└── public/                    # 静态资源
```

---

## 🛠️ 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **数据库**: PostgreSQL + Prisma
- **国际化**: next-intl
- **部署**: Vercel

---

## 📊 数据库模型

### 核心表

- `Product` - 商品
- `Brand` - 品牌
- `Category` - 分类（支持多级）
- `AffiliateLink` - 联盟链接
- `UserBehavior` - 用户行为

详见 `prisma/schema.prisma`

---

## 🔧 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build
npm run start

# 数据库
npm run db:generate
npm run db:push
npm run db:studio

# 代码检查
npm run lint
```

---

## 📈 部署指南

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### 环境变量（生产环境）

```env
DATABASE_URL=your_production_db_url
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
AFFILIATE_KAKOBUY_ID=xxx
AFFILIATE_CNFANS_ID=xxx
AFFILIATE_ACBUY_ID=xxx
```

---

## ⚠️ 法律免责声明

本项目仅用于学习和个人研究。

- 本站不销售任何商品
- 所有商品信息仅供参考
- 请遵守当地法律法规
- 使用本项目产生的任何后果由使用者承担

---

## 📝 待办事项

- [ ] 用户系统（登录/注册）
- [ ] 收藏功能
- [ ] 价格提醒
- [ ] 用户评测
- [ ] 比价功能
- [ ] 更多支付方式

---

## 📄 许可证

MIT License

---

**开发者**: 阿瓜 🥟  
**创建时间**: 2026 年 4 月 12 日
