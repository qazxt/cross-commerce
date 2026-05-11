# FindsIndex 后台管理系统规划

**版本**: v1.0  
**创建日期**: 2026-04-17  
**规划人**: 阿瓜 🥟

---

## 📋 系统定位

**目标用户**: 网站管理员、运营人员

**核心价值**:
- 商品数据管理（CRUD）
- 联盟链接配置与监控
- 数据统计与佣金分析
- 用户与权限管理

---

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 14 App Router（与主站统一）
- **UI 组件**: shadcn/ui + Tailwind CSS
- **图表**: Recharts / Chart.js
- **表格**: TanStack Table（高级表格功能）
- **表单**: React Hook Form + Zod 验证

### 后端
- **API**: Next.js Route Handlers
- **ORM**: Prisma
- **数据库**: SQLite（开发）→ PostgreSQL（生产）
- **认证**: NextAuth.js（与主站统一）

### 部署
- **路径**: `/admin` 子路径
- **权限**: 基于角色的访问控制（RBAC）
- **API**: 与主站共享 `/api` 前缀

---

## 🎯 功能模块

### 模块 1: 仪表盘 (Dashboard)
**路径**: `/admin/dashboard`  
**优先级**: P0

#### 功能
- **核心指标卡片**
  - 今日点击数
  - 累计点击数
  - 预估佣金（今日/累计）
  - 活跃商品数
  - 转化率

- **趋势图表**
  - 点击趋势（7 天/30 天）
  - 佣金趋势（7 天/30 天）
  - 平台对比（柱状图）

- **快速操作**
  - 添加商品
  - 查看联盟链接
  - 数据导出

#### 数据需求
```typescript
interface DashboardMetrics {
  todayClicks: number;
  totalClicks: number;
  todayCommission: number;
  totalCommission: number;
  activeProducts: number;
  conversionRate: number;
  clickTrend: Array<{date: string; clicks: number}>;
  platformStats: Array<{platform: string; clicks: number; commission: number}>;
}
```

---

### 模块 2: 商品管理 (Products)
**路径**: `/admin/products`  
**优先级**: P0

#### 功能列表

##### 2.1 商品列表
- 表格展示（分页、排序、筛选）
- 搜索（标题、SKU、品牌）
- 筛选（分类、品牌、状态）
- 批量操作（上架/下架、删除）

##### 2.2 添加商品
- **基本信息**
  - 标题（中/英）
  - 描述（中/英，富文本编辑器）
  - 品牌（下拉选择 + 新建）
  - 主分类（树形选择）
  - 附加分类（多选）

- **价格信息**
  - 价格区间（min/max）
  - 货币类型（默认 CNY）

- **图片管理**
  - 主图上传（拖拽上传）
  - 附图上传（最多 9 张）
  - 图片排序
  - 图片裁剪/压缩

- **SKU 管理**
  - 规格定义（颜色、尺寸、款式）
  - SKU 组合生成
  - 单独定价
  - 库存管理
  - SKU 图片

- **SEO 设置**
  - Meta Title
  - Meta Description
  - URL Slug（自动生成 + 手动编辑）

##### 2.3 编辑商品
- 同添加商品表单
- 浏览次数、购买次数只读

##### 2.4 商品操作
- 上架/下架
- 设为精选
- 复制商品（快速创建相似商品）
- 删除（软删除）

#### 表单验证
```typescript
const productSchema = z.object({
  title: z.string().min(5).max(200),
  titleEn: z.string().max(200).optional(),
  description: z.string().min(20).optional(),
  priceMin: z.number().positive(),
  priceMax: z.number().positive(),
  brandId: z.string().uuid(),
  primaryCategoryId: z.string().uuid(),
  images: z.array(z.string().url()).min(1),
  skus: z.array(z.object({
    name: z.string(),
    price: z.number(),
    stock: z.number(),
    options: z.record(z.string()),
  })),
});
```

---

### 模块 3: 分类管理 (Categories)
**路径**: `/admin/categories`  
**优先级**: P0

#### 功能列表

##### 3.1 分类列表
- 树形结构展示
- 拖拽排序
- 展开/折叠

##### 3.2 添加分类
- **基本信息**
  - 名称（中/英）
  - Slug（自动生成）
  - 层级（一级/二级/三级）
  - 父分类（树形选择）

- **SEO 设置**
  - Meta Title
  - Meta Description
  - 封面图片

- **显示设置**
  - 排序号
  - 是否激活
  - 别名（用于搜索）

##### 3.3 编辑分类
- 同添加分类表单
- 商品数量统计（只读）

##### 3.4 分类操作
- 移动分类（修改父级）
- 合并分类
- 删除（检查关联商品）

---

### 模块 4: 品牌管理 (Brands)
**路径**: `/admin/brands`  
**优先级**: P0

#### 功能列表

##### 4.1 品牌列表
- 网格展示（Logo + 名称）
- 列表展示（表格）
- 搜索（名称、slug）

##### 4.2 添加品牌
- **基本信息**
  - 名称（中/英）
  - Slug（自动生成）
  - 描述（富文本）
  - Logo 上传

- **SEO 设置**
  - Meta Title
  - Meta Description

##### 4.3 编辑品牌
- 同添加品牌表单
- 商品数量统计（只读）

##### 4.4 品牌操作
- 合并品牌
- 删除（检查关联商品）

---

### 模块 5: 联盟链接管理 (Affiliate Links)
**路径**: `/admin/affiliate`  
**优先级**: P0

#### 功能列表

##### 5.1 链接列表
- 表格展示（分页、筛选）
- 筛选（商品、平台、状态）
- 搜索（商品标题、平台）

##### 5.2 添加链接
- **基本信息**
  - 商品（搜索选择）
  - 平台（下拉选择：10 个平台）
  - 货源链接（1688/微店 URL）
  - 联盟链接（完整 URL）

- **配置**
  - 是否主要链接（每个商品仅 1 个）
  - 是否激活

- **元数据**
  - 货源类型（1688/微店/淘宝）
  - 备注

##### 5.3 批量操作
- **批量生成链接**
  - 选择商品（多选）
  - 选择平台（多选）
  - 自动生成规则（URL 参数模板）

##### 5.4 链接配置
- **平台管理**
  - 平台列表（10 个）
  - 平台颜色配置
  - 平台 Logo 上传
  - 联盟参数模板（如 `?affiliate_id={id}`）

- **参数模板**
  ```json
  {
    "Kakobuy": "?url={source_url}&affiliate_id={affiliate_id}",
    "CNFans": "?url={source_url}&aff={affiliate_id}",
    "Superbuy": "?goodsUrl={source_url}&affiliate_id={affiliate_id}"
  }
  ```

##### 5.5 链接测试
- 链接有效性检查
- 跳转测试

---

### 模块 6: 数据统计 (Analytics)
**路径**: `/admin/analytics`  
**优先级**: P1

#### 功能列表

##### 6.1 点击统计
- **时间范围选择**
  - 今日、昨日、7 天、30 天、自定义

- **维度分析**
  - 按商品（Top 10 点击）
  - 按平台（点击分布）
  - 按分类（点击分布）
  - 按品牌（点击分布）

- **趋势图表**
  - 小时级趋势（今日）
  - 日级趋势（7 天/30 天）

##### 6.2 转化分析
- **转化漏斗**
  ```
  商品浏览 → 链接点击 → 下单 → 确认收货
  ```

- **转化率**
  - 点击转化率（点击/浏览）
  - 订单转化率（订单/点击）
  - 平台对比

- **归因分析**
  - 首次点击归因
  - 末次点击归因

##### 6.3 佣金分析
- **佣金预估**
  - 按平台（佣金率不同）
  - 按商品
  - 按时间

- **佣金趋势**
  - 日级/周级/月级

- **ROI 分析**
  - 流量成本 vs 佣金收入

##### 6.4 用户行为
- **热门商品**
  - 浏览次数 Top 10
  - 点击次数 Top 10
  - 转化率 Top 10

- **用户路径**
  - 典型浏览路径
  - 跳出率分析

##### 6.5 数据导出
- 导出格式：CSV、Excel
- 导出内容：点击记录、商品数据、佣金报表
- 定时导出（每周/每月）

---

### 模块 7: 用户管理 (Users)
**路径**: `/admin/users`  
**优先级**: P2

#### 功能列表

##### 7.1 用户列表
- 表格展示（分页、筛选）
- 筛选（角色、状态）
- 搜索（邮箱、名称）

##### 7.2 用户详情
- 基本信息
- 收藏列表
- 浏览历史
- 点击记录

##### 7.3 角色管理
- **预定义角色**
  - 超级管理员（全部权限）
  - 运营人员（商品/链接管理）
  - 数据分析师（只读数据）
  - 内容编辑（仅商品编辑）

- **权限配置**
  - 模块级权限
  - 操作级权限（增删改查）

##### 7.4 用户操作
- 禁用/启用
- 重置密码
- 角色调整

---

### 模块 8: 系统设置 (Settings)
**路径**: `/admin/settings`  
**优先级**: P2

#### 功能列表

##### 8.1 站点配置
- 站点名称
- Logo 上传
- Favicon 上传
- SEO 默认设置

##### 8.2 国际化配置
- 支持语言
- 默认语言
- 翻译管理

##### 8.3 邮件配置
- SMTP 设置
- 邮件模板
- 通知配置

##### 8.4 存储配置
- 图片存储（本地/OSS/S3）
- 存储桶配置
- CDN 配置

##### 8.5 备份管理
- 数据库备份
- 备份计划
- 恢复操作

---

## 🔐 权限设计

### 角色定义

| 角色 | 商品 | 分类 | 品牌 | 联盟 | 数据 | 用户 | 设置 |
|------|------|------|------|------|------|------|------|
| 超级管理员 | CRUD | CRUD | CRUD | CRUD | R | CRUD | CRUD |
| 运营人员 | CRUD | CRUD | CRUD | CRUD | R | - | - |
| 数据分析师 | R | R | R | R | R | R | - |
| 内容编辑 | CRU | R | R | R | - | - | - |

**权限说明**:
- C = Create（创建）
- R = Read（读取）
- U = Update（更新）
- D = Delete（删除）

---

## 📐 页面布局

### 后台框架
```
┌─────────────────────────────────────────┐
│  Sidebar  │  Top Bar                    │
│           ├─────────────────────────────┤
│  - 仪表盘  │  Content Area              │
│  - 商品   │                             │
│  - 分类   │  页面内容                   │
│  - 品牌   │                             │
│  - 联盟   │                             │
│  - 数据   │                             │
│  - 用户   │                             │
│  - 设置   │                             │
└───────────┴─────────────────────────────┘
```

### 响应式断点
- Desktop: >1024px（侧边栏展开）
- Tablet: 768-1024px（侧边栏可折叠）
- Mobile: <768px（汉堡菜单）

---

## 🗄️ 数据库扩展

### 新增表

#### 1. 佣金配置表
```prisma
model CommissionConfig {
  id        String   @id @default(uuid())
  platform  String   @unique
  rate      Float    // 佣金率（如 0.03 = 3%）
  minAmount Int      // 最低提现金额
  isActive  Boolean  @default(true)
  updatedAt DateTime @updatedAt
}
```

#### 2. 点击记录表（扩展）
```prisma
model AffiliateClick {
  id          String   @id @default(uuid())
  linkId      String
  productId   String
  platform    String
  sessionId   String
  userId      String?  // 如果已登录
  ip          String?
  userAgent   String?
  referer     String?
  createdAt   DateTime @default(now())
  
  // 转化追踪
  orderId     String?  // 订单 ID（如果转化）
  orderAmount Float?   // 订单金额
  commission  Float?   // 佣金
  isConverted Boolean  @default(false)
  
  @@index([linkId])
  @@index([productId])
  @@index([createdAt])
}
```

#### 3. 管理员操作日志
```prisma
model AdminLog {
  id        String   @id @default(uuid())
  adminId   String
  action    String   // CREATE_PRODUCT, UPDATE_LINK, etc.
  module    String   // product, affiliate, etc.
  targetId  String?  // 操作对象 ID
  details   String?  // JSON 详情
  ip        String?
  createdAt DateTime @default(now())
  
  @@index([adminId])
  @@index([createdAt])
}
```

---

## 🔌 API 设计

### 商品管理
```
GET    /api/admin/products          # 商品列表
POST   /api/admin/products          # 创建商品
GET    /api/admin/products/:id      # 商品详情
PUT    /api/admin/products/:id      # 更新商品
DELETE /api/admin/products/:id      # 删除商品
POST   /api/admin/products/batch    # 批量操作
```

### 分类管理
```
GET    /api/admin/categories        # 分类列表（树形）
POST   /api/admin/categories        # 创建分类
PUT    /api/admin/categories/:id    # 更新分类
DELETE /api/admin/categories/:id    # 删除分类
PUT    /api/admin/categories/reorder # 重新排序
```

### 品牌管理
```
GET    /api/admin/brands            # 品牌列表
POST   /api/admin/brands            # 创建品牌
PUT    /api/admin/brands/:id        # 更新品牌
DELETE /api/admin/brands/:id        # 删除品牌
```

### 联盟链接
```
GET    /api/admin/affiliate/links   # 链接列表
POST   /api/admin/affiliate/links   # 创建链接
PUT    /api/admin/affiliate/links/:id # 更新链接
DELETE /api/admin/affiliate/links/:id # 删除链接
POST   /api/admin/affiliate/batch   # 批量生成
GET    /api/admin/affiliate/platforms # 平台列表
PUT    /api/admin/affiliate/platforms/:id # 更新平台配置
```

### 数据统计
```
GET    /api/admin/analytics/dashboard # 仪表盘数据
GET    /api/admin/analytics/clicks    # 点击统计
GET    /api/admin/analytics/commission # 佣金统计
GET    /api/admin/analytics/conversion # 转化分析
POST   /api/admin/analytics/export    # 导出报表
```

---

## 📅 开发计划

### Phase 1: 基础后台（2 周）
**目标**: 完成商品、分类、品牌、联盟链接管理

#### Week 1
- [ ] 后台框架搭建（布局、路由、认证）
- [ ] 商品管理（列表、CRUD）
- [ ] 分类管理（树形结构）

#### Week 2
- [ ] 品牌管理
- [ ] 联盟链接管理
- [ ] 批量操作功能

**交付物**: 可日常使用的后台系统

---

### Phase 2: 数据统计（1 周）
**目标**: 完成数据看板和基础分析

#### Week 3
- [ ] 仪表盘（核心指标、趋势图）
- [ ] 点击统计（多维度分析）
- [ ] 数据导出功能

**交付物**: 数据可视化看板

---

### Phase 3: 高级功能（1 周）
**目标**: 用户管理、系统设置、优化

#### Week 4
- [ ] 用户管理（RBAC 权限）
- [ ] 系统设置
- [ ] 操作日志
- [ ] 性能优化

**交付物**: 完整后台系统

---

## 🎨 UI/UX 设计要点

### 设计原则
1. **效率优先**: 减少点击次数，支持快捷键
2. **批量操作**: 支持多选、批量处理
3. **即时反馈**: 操作成功/失败即时提示
4. **数据安全**: 删除操作二次确认
5. **响应式**: 支持移动端管理

### 交互细节
- **表格**
  - 列宽可调
  - 列显示/隐藏
  - 固定表头
  - 行内编辑（部分字段）

- **表单**
  - 自动保存草稿
  - 字段验证（实时提示）
  - 分步表单（复杂场景）
  - 快捷键（Ctrl+S 保存）

- **图片上传**
  - 拖拽上传
  - 多图选择
  - 图片裁剪
  - 进度显示

---

## 🔒 安全考虑

### 认证安全
- JWT Token（2 小时过期）
- Refresh Token（7 天）
- 登录失败限制（5 次锁定）
- 双因素认证（可选）

### 权限控制
- 后端中间件验证
- 前端路由守卫
- API 级别权限检查
- 操作日志记录

### 数据安全
- SQL 注入防护（Prisma ORM）
- XSS 防护（输入过滤）
- CSRF 防护（Token 验证）
- 敏感数据加密

---

## 📊 成功指标

### 功能完整性
- [ ] 商品管理 100%
- [ ] 分类/品牌管理 100%
- [ ] 联盟链接管理 100%
- [ ] 数据统计 80%
- [ ] 用户管理 100%

### 性能指标
- 页面加载 < 2s
- API 响应 < 500ms
- 支持并发 10+ 管理员

### 用户体验
- 核心操作 < 3 次点击
- 表单错误率 < 5%
- 用户满意度 > 4.5/5

---

## 📝 附录

### A. 竞品参考
- Shopify Admin
- WooCommerce Admin
- Discourse Admin Panel

### B. 技术选型对比
| 功能 | 方案 A | 方案 B | 最终选择 |
|------|--------|--------|----------|
| 图表 | Recharts | Chart.js | Recharts |
| 表格 | TanStack Table | AG Grid | TanStack Table |
| 富文本 | TipTap | Quill | TipTap |
| 文件上传 | UploadThing | AWS S3 | UploadThing |

### C. 待确认事项
1. 是否需要多语言后台？
2. 是否需要移动端 App？
3. 是否需要 API 开放平台？

---

**文档版本**: v1.0  
**最后更新**: 2026-04-17  
**维护者**: 阿瓜 🥟
