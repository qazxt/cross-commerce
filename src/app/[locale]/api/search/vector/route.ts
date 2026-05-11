/**
 * 向量搜索 API
 * 
 * 支持：
 * 1. 文本语义搜索（使用 embedding）
 * 2. 混合搜索（文本 + 关键词）
 * 3. 图片搜索（使用 image embedding）
 * 
 * GET /api/search/vector?q=nike+shoes&limit=20
 * POST /api/search/vector
 * {
 *   "query": "nike shoes",
 *   "mode": "text|image|hybrid",
 *   "imageEmbedding": [...], // 可选
 *   "filters": { "category": "...", "brand": "..." }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseEmbedding, cosineSimilarity, findTopK } from '@/lib/vector';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
    const mode = searchParams.get('mode') || 'hybrid'; // text | vector | hybrid

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // 方案 1: 纯向量搜索（需要先生成 query embedding）
    if (mode === 'vector') {
      return vectorSearch(query, limit);
    }

    // 方案 2: 混合搜索（关键词 + 向量 rerank）
    if (mode === 'hybrid') {
      return hybridSearch(query, limit);
    }

    // 方案 3: 传统关键词搜索
    return keywordSearch(query, limit);
  } catch (error) {
    console.error('Vector search failed:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

// 关键词搜索（fallback）
async function keywordSearch(query: string, limit: number) {
  const where = {
    status: 'active',
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { titleEn: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
    ],
  };

  const products = await db.product.findMany({
    where,
    take: limit,
    include: {
      brand: true,
      primaryCategory: true,
    },
    orderBy: {
      popularityScore: 'desc',
    },
  });

  return NextResponse.json({
    products,
    total: products.length,
    mode: 'keyword',
  });
}

// 向量搜索（需要先获取所有 embedding，内存计算相似度）
async function vectorSearch(query: string, limit: number) {
  // 步骤 1: 生成 query 的 embedding
  // 注意：实际部署时需要调用 embedding 模型
  const queryEmbedding = await generateQueryEmbedding(query);

  // 步骤 2: 获取所有有 embedding 的商品
  const products = await db.product.findMany({
    where: {
      status: 'active',
      hasEmbedding: true,
      embedding: {
        not: null,
      },
    },
    include: {
      brand: true,
      primaryCategory: true,
    },
  });

  // 步骤 3: 内存计算相似度
  const scored = products
    .map(product => {
      const embedding = parseEmbedding(product.embedding);
      if (!embedding) return null;

      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return {
        ...product,
        _score: similarity,
      };
    })
    .filter(Boolean) as Array<typeof products[0] & { _score: number }>;

  // 步骤 4: 排序并返回 top-K
  scored.sort((a, b) => b._score - a._score);
  const topK = scored.slice(0, limit);

  return NextResponse.json({
    products: topK,
    total: topK.length,
    mode: 'vector',
    query,
  });
}

// 混合搜索：关键词初筛 + 向量重排序
async function hybridSearch(query: string, limit: number) {
  // 步骤 1: 关键词初筛（缩小范围）
  const candidates = await db.product.findMany({
    where: {
      status: 'active',
      hasEmbedding: true,
      embedding: {
        not: null,
      },
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { titleEn: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
      ],
    },
    include: {
      brand: true,
      primaryCategory: true,
    },
    take: limit * 3, // 多取一些用于 rerank
  });

  if (candidates.length === 0) {
    return keywordSearch(query, limit);
  }

  // 步骤 2: 生成 query embedding
  const queryEmbedding = await generateQueryEmbedding(query);

  // 步骤 3: 计算相似度并排序
  const scored = candidates
    .map(product => {
      const embedding = parseEmbedding(product.embedding);
      if (!embedding) return null;

      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return {
        ...product,
        _score: similarity,
      };
    })
    .filter(Boolean) as Array<typeof candidates[0] & { _score: number }>;

  scored.sort((a, b) => b._score - a._score);

  return NextResponse.json({
    products: scored.slice(0, limit),
    total: scored.length,
    mode: 'hybrid',
    query,
  });
}

// 生成 query 的 embedding
// 实际部署时应该调用 embedding 模型
async function generateQueryEmbedding(query: string): Promise<number[]> {
  // TODO: 调用 embedding 模型
  // 现在返回伪向量用于测试
  const hash = simpleHash(query);
  const vector = new Array(1024).fill(0).map((_, i) => {
    return Math.sin(hash + i * 0.1);
  });
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => v / norm);
}

// 简单哈希
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
