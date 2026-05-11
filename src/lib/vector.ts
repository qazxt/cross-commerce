/**
 * 向量计算工具 - 使用余弦相似度
 * SQLite 兼容方案：向量存 JSON，搜索时内存计算
 */

// 计算余弦相似度
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vector dimensions must match');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// 计算欧几里得距离
export function euclideanDistance(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vector dimensions must match');
  }

  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += Math.pow(vec1[i] - vec2[i], 2);
  }

  return Math.sqrt(sum);
}

// 解析向量 JSON
export function parseEmbedding(embeddingJson: string | null): number[] | null {
  if (!embeddingJson) return null;
  try {
    return JSON.parse(embeddingJson);
  } catch {
    return null;
  }
}

// 为商品文本生成搜索字符串
export function generateSearchText(product: {
  title: string;
  titleEn?: string | null;
  description?: string | null;
  brandName?: string;
  categoryName?: string;
}): string {
  const parts = [
    product.title,
    product.titleEn || '',
    product.description || '',
    product.brandName || '',
    product.categoryName || '',
  ];
  return parts.filter(Boolean).join(' ');
}

// top-K 搜索
export function findTopK(
  queryVector: number[],
  candidates: { id: string; embedding: number[] }[],
  k: number = 10
): { id: string; similarity: number }[] {
  const scores = candidates
    .filter(c => c.embedding && c.embedding.length === queryVector.length)
    .map(c => ({
      id: c.id,
      similarity: cosineSimilarity(queryVector, c.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);

  return scores;
}