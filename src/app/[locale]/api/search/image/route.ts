/**
 * 图片搜索 API - 以图搜图
 * 
 * 使用 CLIP 模型将图片转换为向量，然后搜索相似商品
 * 
 * POST /api/search/image
 * {
 *   "imageUrl": "https://...", // 图片 URL
 *   "imageBase64": "data:image/...", // 或 Base64
 *   "limit": 20
 * }
 * 
 * 返回：
 * {
 *   "products": [...],
 *   "total": 20
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseEmbedding, cosineSimilarity } from '@/lib/vector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, imageBase64, limit = 20 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'imageUrl or imageBase64 required' },
        { status: 400 }
      );
    }

    // 步骤 1: 生成图片 embedding
    let imageEmbedding: number[];
    
    if (imageBase64) {
      imageEmbedding = await generateImageEmbedding(imageBase64);
    } else {
      imageEmbedding = await generateImageEmbeddingFromUrl(imageUrl);
    }

    // 步骤 2: 获取所有有 image embedding 的商品
    const products = await db.product.findMany({
      where: {
        status: 'active',
        hasEmbedding: true,
        imageEmbedding: {
          not: null,
        },
      },
      include: {
        brand: true,
        primaryCategory: true,
      },
    });

    // 步骤 3: 计算相似度
    const scored = products
      .map(product => {
        const embedding = parseEmbedding(product.imageEmbedding);
        if (!embedding) return null;

        const similarity = cosineSimilarity(imageEmbedding, embedding);
        return {
          ...product,
          _score: similarity,
        };
      })
      .filter(Boolean) as Array<typeof products[0] & { _score: number }>;

    // 步骤 4: 排序并返回 top-K
    scored.sort((a, b) => b._score - a._score);

    return NextResponse.json({
      products: scored.slice(0, limit),
      total: scored.length,
      queryImage: imageUrl || imageBase64?.substring(0, 50) + '...',
    });
  } catch (error) {
    console.error('Image search failed:', error);
    return NextResponse.json(
      { error: 'Image search failed', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

// 从 URL 生成图片 embedding
async function generateImageEmbeddingFromUrl(url: string): Promise<number[]> {
  // TODO: 调用 CLIP 模型
  // 可以使用：
  // 1. @xenova/transformers (本地运行 CLIP)
  // 2. HuggingFace Inference API
  // 3. Replicate API
  
  console.log('Generating embedding for image:', url);
  
  // 返回伪向量用于测试
  return generateMockEmbedding(url);
}

// 从 Base64 生成图片 embedding
async function generateImageEmbedding(base64: string): Promise<number[]> {
  // TODO: 解码并调用 CLIP 模型
  console.log('Generating embedding for base64 image...');
  return generateMockEmbedding(base64.substring(0, 100));
}

// 伪 embedding 生成（测试用）
function generateMockEmbedding(seed: string): number[] {
  const hash = simpleHash(seed);
  const vector = new Array(512).fill(0).map((_, i) => {
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
