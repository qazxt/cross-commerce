# 后台系统修复计划

**日期**: 2026-04-25

## Phase 1 - 核心 CRUD ✅ 完成

### 1. 分类管理 ✅
- [x] 创建 `/admin/categories/create` 页面
- [x] 创建 `/admin/api/categories` POST/PUT/DELETE 路由
- [x] 分类列表页编辑/删除按钮绑定事件（client 组件）
- [x] 删除确认对话框 + 关联商品检查
- [x] 创建 `/admin/categories/edit` 页面

### 2. 品牌管理 ✅
- [x] 创建 `/admin/brands/create` 页面
- [x] 创建 `/admin/api/brands` POST/PUT/DELETE 路由
- [x] 品牌列表页编辑/删除按钮绑定事件（client 组件）
- [x] 删除确认对话框 + 关联商品检查
- [x] 创建 `/admin/brands/edit` 页面

### 3. 联盟链接管理 ✅
- [x] 创建 `/admin/affiliate/create` 页面（10个平台选择）
- [x] 完善联盟链接 API（PUT/DELETE）
- [x] 联盟链接删除功能 + 复制功能（client 组件）
- [x] 创建 `/admin/affiliate/page.tsx` server + `AffiliateList.tsx` client

## Phase 2 - 商品管理完善 ✅

### 4. 商品搜索筛选器 ✅
- [x] 搜索框改为 `<form action>` 方式提交
- [x] 状态下拉框联动搜索参数
- [x] 添加搜索按钮和重置按钮

### 5. 商品删除 ✅
- [x] 商品删除确认对话框 + API 调用

### 6. 数据统计 ✅
- [x] 重写 Analytics 页面（7天趋势、热门商品TOP10、平台排行）
- [x] 实时数据查询（今日/7天/总点击、总浏览）

### 7. 系统设置 ✅
- [x] 数据库统计信息（SQLite大小、数据量）
- [x] 站点信息概览卡片

## Phase 3 - 功能模块

### 7. 设置页
- [ ] 站点配置
- [ ] 数据库备份

### 8. 数据统计
- [ ] 点击统计
- [ ] 转化率
- [ ] 佣金预估
- [ ] 趋势分析

## Phase 4 - 测试验收
- [ ] 前端构建检查
- [ ] 数据库迁移
- [ ] 手动功能测试
