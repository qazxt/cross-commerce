# 向量搜索功能实现文档 🧠

> 创建日期：2026-05-10  
> 状态：代码完成，待测试

---

## 📋 功能概述

为 FindsIndex Clone 添加向量搜索功能，支持：
1. **文本语义搜索** - 理解用户意图，不只是关键词匹配
2. **以图搜图** - 上传图片找相似商品
3. **混合搜索** - 关键词 + 向量重排序

---

## 🗂️ 文件清单

### 新增文件

| 文件 | 用途 |
|------|------|
| `src/lib/vector.ts` | 向量计算工具（余弦相似度等） |
| `scripts/generate-embeddings.ts` | 批量生成商品嵌入 |
| `src/app/[locale]/api/search/vector/route.ts` | 向量搜索 API |
| `src/app/[locale]/api/search/image/route.ts` | 图片搜索 API |
| `src/components/search/SmartSearchBar.tsx` | 智能搜索组件 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `prisma/schema.prisma` | Product 模型添加 embedding 字段 |

---

## 🗄️ 数据库变更

### Product 模型新增字段

```prisma
// 向量搜索字段
embedding         String?  // JSON 存储 1024 维文本向量
imageEmbedding    String?  // JSON 存储 512 维图片向量
hasEmbedding      Boolean  @default(false)

// AI 生成属性
aiBrandName       String?
aiAttributes      String?  // JSON 存储 { gender, style, ... }
```

### 迁移步骤

```bash
# 1. 更新 Prisma Schema
cd /workspace/findsindex-clone
# (已更新 schema.prisma)

# 2. 生成迁移
npx prisma migrate dev --name add_vector_search

# 3. 或直接推送（开发环境）
npx prisma db push

# 4. 重新生成 Prisma Client
npx prisma generate
```

---

## 🚀 使用指南

### 1. 生成商品嵌入

```bash
# 设置 HuggingFace Token（可选，用于真实 embedding）
export HUGGINGFACE_TOKEN=your_token_here

# 运行嵌入生成脚本
npx tsx scripts/generate-embeddings.ts
```

**说明：**
- 首次运行会生成所有商品的 embedding
- 使用 BGE-M3 模型（1024 维）
- 支持批量处理（默认每次 10 个）
- 无 Token 时使用伪向量（测试用）

### 2. 搜索 API

#### 向量搜索
```bash
GET /api/search/vector?q=nike+shoes&mode=vector&limit=20
```

#### 混合搜索（推荐）
```bash
GET /api/search/vector?q=comfortable+running+shoes&mode=hybrid&limit=20
```

#### 图片搜索
```bash
POST /api/search/image
Content-Type: application/json

{
  "imageUrl": "https://example.com/shoe.jpg",
  "limit": 20
}
```

### 3. 前端组件

```tsx
import SmartSearchBar from '@/components/search/SmartSearchBar';

export default function Header() {
  return (
    <header>
      <SmartSearchBar 
        placeholder="搜索商品，如 '舒适的跑步鞋'..."
      />
    </header>
  );
}
```

---

## 🔧 技术细节

### 嵌入模型选择

| 模型 | 维度 | 速度 | 质量 | 成本 |
|------|------|------|------|------|
| BGE-M3 | 1024 | 中 | 优秀 | 免费 |
| text-embedding-3-small | 1536 | 快 | 优秀 | $ |
| E5-large-v2 | 1024 | 中 | 良好 | 免费 |

**推荐：** BGE-M3（免费 + 多语言支持）

### 图片搜索模型

| 模型 | 用途 |
|------|------|
| CLIP ViT-B/32 | 通用图片搜索 |
| SigLIP | 更准确的相似度 |

### 性能优化

1. **缓存** - 查询 embedding 结果缓存到 Redis
2. **预计算** - 离线生成所有商品 embedding
3. **近似搜索** - 数据量大时用 FAISS / Annoy

---

## 📊 测试计划

### 单元测试
```bash
# 向量计算测试
npx jest src/lib/vector.test.ts

# API 测试
npx jest src/app/api/search/vector.test.ts
```

### 集成测试
```bash
# 搜索质量测试
python scripts/test_search_quality.py

# 性能测试
ab -n 1000 -c 10 http://localhost:3000/api/search/vector?q=nike
```

### 人工测试清单
- [ ] 关键词搜索 vs 向量搜索结果对比
- [ ] 同义词理解（如 "sneakers" = "运动鞋"）
- [ ] 拼写错误容错
- [ ] 图片搜索准确性
- [ ] 搜索速度 < 500ms

---

## 🎯 下一步

### Phase 1 - 基础功能（已完成 ✅）
- [x] 向量计算工具
- [x] 嵌入生成脚本
- [x] 搜索 API
- [x] 前端组件

### Phase 2 - 优化（待做）
- [ ] 集成真实 embedding 模型
- [ ] 搜索日志分析
- [ ] A/B 测试框架

### Phase 3 - 高级功能
- [ ] 个性化推荐（基于用户行为）
- [ ] 搜索纠错
- [ ] 多模态搜索（文本 + 图片）

---

## 🐛 故障排查

### 问题：搜索结果为空
**解决：** 检查商品是否有 embedding
```sql
SELECT COUNT(*) FROM Product WHERE hasEmbedding = true;
```

### 问题：搜索速度慢
**解决：** 
1. 减少候选集（先用关键词过滤）
2. 添加缓存层
3. 使用近似最近邻搜索

### 问题：搜索结果不准确
**解决：**
1. 检查 embedding 质量
2. 调整混合搜索权重
3. 收集用户反馈优化

---

## 📚 参考资料

- [BGE-M3 模型](https://huggingface.co/BAAI/bge-m3)
- [CLIP 模型](https://openai.com/research/clip)
- [向量搜索最佳实践](https://weaviate.io/blog/vector-search-best-practices)

---

**维护者**: 阿瓜 🥟  
**最后更新**: 2026-05-10
