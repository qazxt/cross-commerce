# 🕷️ FindsIndex 爬虫

基于 Crawlee + Playwright + API 爬虫

## 功能

- ✅ API 爬虫（推荐）- 快速、稳定、结构化数据
- 🔄 网页爬虫（备用）- 处理 JS 渲染页面
- 📊 数据采集 - 商品、品牌、分类

## 快速开始

```bash
# 安装依赖
npm install

# 运行 API 爬虫（推荐）
npm run crawl:api

# 导入热门商品到数据库
npm run import:popular

# 运行网页爬虫
npm run crawl

# 开发模式
npm run crawl:dev
```

## 数据源

### API 爬虫（推荐）

**端点**: `https://findsindex.com/api/products`

**参数**:
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20，最大 100）
- `sortBy`: 排序字段（popular, newest, price_asc, price_desc）
- `brand`: 品牌筛选
- `category`: 分类筛选

**示例**:
```bash
# 获取前 1000 个商品
npm run crawl:api

# 获取热门商品
curl "https://findsindex.com/api/products?sortBy=popular&limit=100"

# 获取特定品牌
curl "https://findsindex.com/api/products?brand=nike&limit=100"
```

### 网页爬虫

**注意**: 网站有 Cloudflare 防护，可能需要代理或 stealth 模式

## 数据结构

```json
{
  "id": "uuid",
  "title": "商品标题",
  "slug": "商品 slug",
  "description": "详细描述",
  "mainImage": "主图 URL",
  "images": ["图片数组"],
  "currency": "CNY",
  "priceMin": 154.8,
  "priceMax": 154.8,
  "brand": {
    "id": "uuid",
    "name": "品牌名",
    "slug": "品牌 slug"
  },
  "primaryCategory": {
    "id": "uuid",
    "name": "分类名",
    "slug": "分类 slug"
  },
  "aiBrandName": "AI 识别品牌",
  "aiAttributes": {
    "gender": "Unisex/Men/Women"
  }
}
```

## 统计数据

- **总商品数**: 209,491
- **品牌数**: 500+
- **分类数**: 100+

## 输出

数据保存在 `crawler/storage/data/` 目录下：

```
crawler/storage/data/
├── products-2026-04-26T07-04-45-198Z.json
└── ...
```

## 配置

编辑 `crawler/api-crawler.ts`:

```typescript
const CONFIG = {
  baseUrl: 'https://findsindex.com',
  maxPages: 10,     // 最大页数
  limit: 100,       // 每页数量
  delay: 500,       // 请求间隔 (ms)
};
```

## 注意事项

1. **频率限制**: 建议请求间隔 ≥ 500ms
2. **数据量**: 全量数据约 200K 商品，需要约 2000 次请求
3. **存储**: JSON 格式约 500MB+，建议定期清理
4. **合规**: 仅用于个人研究，遵守网站 robots.txt

## 下一步

- [ ] 数据导入数据库
- [ ] 定时更新任务
- [ ] 数据清洗和标准化
- [ ] 图片下载和缓存
- [ ] 品牌/分类映射
