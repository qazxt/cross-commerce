# FindsIndex 复刻项目 - 第二阶段开发计划

> 基于原网站 findsindex.com 的完整功能分析和开发规划  
> 创建时间：2026-04-12  
> 当前完成度：80%（前端基础完成）

---

## 📊 原网站结构分析

### 1. 网站区域划分

#### 1.1 核心购物区域 (Shop Area)
```
┌─────────────────────────────────────────────────────┐
│  主导航栏                                            │
│  [Logo] [Categories] [Brands] [New] [Products]      │
│  [Search Bar] [User Account]                        │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  左侧边栏 (Desktop) / 底部导航 (Mobile)              │
│  - 分类导航                                         │
│  - 品牌导航                                         │
│  - 筛选器                                           │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  主内容区                                            │
│  - 商品列表/网格                                    │
│  - 商品详情                                         │
│  - 分类页面                                         │
│  - 品牌页面                                         │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  页脚                                                │
│  - About / Shop / Support / Legal                   │
│  - 社交媒体链接                                     │
│  - 版权信息                                         │
└─────────────────────────────────────────────────────┘
```

#### 1.2 用户账户区域 (Account Area)
- 用户概览
- 收藏夹管理
- 浏览历史
- 推荐计划
- 安全设置
- 积分系统

#### 1.3 信息页面区域 (Info Pages)
- How It Works（使用指南）
- Help Center（帮助中心）
- Shipping Guide（配送指南）
- Returns & Refunds（退换货）
- About Us（关于我们）
- Contact Us（联系我们）
- Terms/Privacy/Cookies（法律条款）

---

## 🎯 第二阶段开发任务

### Phase 2.1: 完善核心购物功能 (优先级：P0)

#### 2.1.1 商品详情页增强
**当前状态**: 基础页面完成  
**需要补充**:

- [ ] **SKU 选择器**
  - 颜色选择
  - 尺寸选择
  - 款式选择
  - 库存显示
  - 价格随 SKU 变化

- [ ] **商品图片画廊**
  - 主图放大查看
  - 缩略图导航
  - 图片懒加载
  - 支持视频

- [ ] **商品描述**
  - 详细描述区域
  - 规格参数表
  - 材质说明
  - 尺码指南

- [ ] **购买链接**
  - 多平台选择（Kakobuy, CNFans, ACBuy 等）
  - 记住用户偏好
  - 一键跳转

- [ ] **相关推荐**
  - 同类商品推荐
  - 搭配推荐
  - 浏览历史推荐

**API 接口**:
```typescript
// GET /api/products/[slug]
{
  product: {
    id, slug, title, description,
    priceMin, priceMax, currency,
    images: [], videos: [],
    skus: [{
      id, name, price, stock,
      options: { color, size, style }
    }],
    attributes: [],
    affiliateLinks: []
  },
  related: [],
  completeTheLook: []
}
```

#### 2.1.2 搜索功能增强
**当前状态**: 基础搜索完成  
**需要补充**:

- [ ] **高级筛选器**
  - 价格范围滑块
  - 颜色筛选（带色块预览）
  - 品牌多选
  - 分类多选
  - 性别筛选
  - 风格筛选
  - 季节筛选
  - 场合筛选

- [ ] **排序选项**
  - 相关性
  - 最新上架
  - 价格从低到高
  - 价格从高到低
  - 最受欢迎
  - 销量最高

- [ ] **搜索建议**
  - 热门搜索词
  - 搜索历史
  - 自动补全
  - 拼写纠正

- [ ] **视觉搜索**
  - 图片上传搜索
  - 截图搜索
  - 相似商品推荐

**API 接口**:
```typescript
// GET /api/search
{
  products: [],
  total: number,
  page: number,
  totalPages: number,
  facets: {
    categories: [],
    brands: [],
    colors: [],
    priceRanges: [],
    genders: [],
    styles: []
  },
  suggestions: [],
  hotSearches: []
}
```

#### 2.1.3 分类和品牌页面
**当前状态**: 页面框架完成  
**需要补充**:

- [ ] **分类页面**
  - 分类层级展示
  - 分类封面图
  - 子分类网格
  - 热门分类推荐
  - 分类商品筛选

- [ ] **品牌页面**
  - 品牌 Logo 展示
  - 品牌故事/描述
  - 品牌商品网格
  - 热门品牌推荐
  - 品牌字母索引

**API 接口**:
```typescript
// GET /api/categories/[slug]
{
  category: {
    id, name, slug, description,
    coverImage, level, parent,
    children: [],
    products: [],
    productCount: number
  }
}

// GET /api/brands/[slug]
{
  brand: {
    id, name, slug, description,
    logoUrl, productCount,
    products: [],
    relatedBrands: []
  }
}
```

---

### Phase 2.2: 用户系统开发 (优先级：P1)

#### 2.2.1 认证系统
- [ ] **注册/登录**
  - 邮箱注册
  - 邮箱登录
  - 密码加密存储
  - 邮箱验证
  - 忘记密码流程

- [ ] **社交登录**
  - Google OAuth
  - Discord OAuth
  - Telegram OAuth

- [ ] **会话管理**
  - JWT Token
  - 刷新 Token
  - 多设备管理
  - 安全退出

**API 接口**:
```typescript
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
// GET /api/auth/verify-email
```

#### 2.2.2 用户账户
- [ ] **账户概览**
  - 用户信息展示
  - 统计数据（浏览、收藏、推荐）
  - 快速操作入口

- [ ] **收藏夹管理**
  - 添加/取消收藏
  - 收藏夹分类
  - 批量操作
  - 收藏排序

- [ ] **浏览历史**
  - 自动记录
  - 历史记录管理
  - 清除历史
  - 历史数量限制

- [ ] **账户设置**
  - 修改密码
  - 修改邮箱
  - 头像上传
  - 语言偏好
  - 货币偏好

**API 接口**:
```typescript
// GET /api/user/profile
// PUT /api/user/profile
// GET /api/user/favorites
// POST /api/user/favorites
// DELETE /api/user/favorites/[id]
// GET /api/user/history
// DELETE /api/user/history
```

#### 2.2.3 积分和推荐系统
- [ ] **积分系统**
  - 每日签到
  - 分享奖励
  - 注册奖励
  - 邮箱验证奖励
  - 收藏奖励
  - 积分余额显示
  - 积分明细

- [ ] **推荐计划**
  - 生成推荐码
  - 推荐链接分享
  - 推荐统计（点击、注册、转化）
  - 推荐奖励
  - 被推荐人进度追踪

- [ ] **积分提现**
  - 提现申请
  - 提现记录
  - 支付方式管理
  - 提现规则说明

**API 接口**:
```typescript
// GET /api/user/points
// POST /api/user/points/checkin
// GET /api/user/points/history
// GET /api/user/referral
// POST /api/user/referral/withdraw
// GET /api/user/referral/records
```

---

### Phase 2.3: 数据爬取和导入 (优先级：P0)

#### 2.3.1 爬虫系统
- [ ] **数据源分析**
  - Kakobuy API
  - CNFans API
  - ACBuy API
  - 其他代购平台

- [ ] **爬虫脚本**
  - 分类数据爬取
  - 品牌数据爬取
  - 商品数据爬取
  - 图片下载和 CDN 上传
  - 数据清洗和格式化

- [ ] **定时任务**
  - 每日更新商品
  - 价格同步
  - 库存同步
  - 新商品发现

**技术栈**:
```python
# Python 爬虫
- requests / aiohttp
- BeautifulSoup4
- Scrapy
- Selenium (如需 JS 渲染)

# 定时任务
- APScheduler
- Celery + Redis
```

#### 2.3.2 数据导入工具
- [ ] **批量导入**
  - JSON 数据导入
  - CSV 数据导入
  - 数据库直接导入

- [ ] **数据验证**
  - 数据完整性检查
  - 重复数据检测
  - 数据格式验证

- [ ] **数据同步**
  - 增量更新
  - 全量更新
  - 差异对比

---

### Phase 2.4: 管理后台 (优先级：P2)

#### 2.4.1 商品管理
- [ ] 商品列表
- [ ] 添加商品
- [ ] 编辑商品
- [ ] 删除商品
- [ ] 批量操作
- [ ] 商品审核

#### 2.4.2 分类和品牌管理
- [ ] 分类管理（增删改查）
- [ ] 品牌管理（增删改查）
- [ ] 分类层级管理
- [ ] 品牌 Logo 上传

#### 2.4.3 数据统计
- [ ] 访问统计
- [ ] 商品统计
- [ ] 用户统计
- [ ] 点击统计
- [ ] 转化统计
- [ ] 图表展示

---

### Phase 2.5: SEO 和优化 (优先级：P1)

#### 2.5.1 SEO 优化
- [ ] **Meta 标签**
  - 动态 title
  - 动态 description
  - Open Graph 标签
  - Twitter Card 标签

- [ ] **结构化数据**
  - Product Schema
  - Breadcrumb Schema
  - Organization Schema
  - SearchAction Schema

- [ ] **Sitemap**
  - 自动生成 sitemap.xml
  - 提交到 Google Search Console
  - 提交到 Bing Webmaster

- [ ] **Robots.txt**
  - 配置爬虫规则
  - 提交到搜索引擎

#### 2.5.2 性能优化
- [ ] **图片优化**
  - WebP 格式
  - 响应式图片
  - 懒加载
  - CDN 加速

- [ ] **代码优化**
  - 代码分割
  - Tree Shaking
  - 按需加载
  - 缓存策略

- [ ] **数据库优化**
  - 索引优化
  - 查询优化
  - 连接池配置
  - 读写分离

---

## 📅 开发时间表

### Week 1-2: 核心功能完善
- [ ] 商品详情页 SKU 选择器
- [ ] 商品详情页图片画廊
- [ ] 搜索筛选器增强
- [ ] 数据爬取脚本

### Week 3-4: 用户系统
- [ ] 注册/登录功能
- [ ] 收藏夹管理
- [ ] 浏览历史
- [ ] 账户设置

### Week 5-6: 数据和 SEO
- [ ] 批量数据导入
- [ ] SEO 优化
- [ ] 性能优化
- [ ] 管理后台基础

### Week 7-8: 完善和测试
- [ ] 积分和推荐系统
- [ ] 完整测试
- [ ] Bug 修复
- [ ] 上线准备

---

## 🔧 技术栈建议

### 前端
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query (数据获取)
- Zustand (状态管理)

### 后端
- Next.js API Routes
- Prisma (ORM)
- PostgreSQL / SQLite
- NextAuth.js (认证)

### 爬虫
- Python + aiohttp
- BeautifulSoup4
- APScheduler (定时任务)

### 部署
- Vercel (前端)
- Supabase (数据库)
- Cloudflare (CDN)

---

## 📝 下一步立即行动

1. **完善商品详情页** (1-2 天)
   - SKU 选择器
   - 图片画廊
   - 购买链接

2. **开发数据爬取脚本** (2-3 天)
   - 分析目标网站
   - 编写爬虫
   - 测试数据导入

3. **实现搜索筛选器** (2-3 天)
   - 高级筛选 UI
   - 筛选逻辑
   - 排序功能

4. **用户认证系统** (3-4 天)
   - 注册/登录
   - 会话管理
   - 保护路由

---

**文档版本**: v1.0  
**最后更新**: 2026-04-12  
**维护者**: 阿瓜 🥟
