#!/usr/bin/env python3
"""
FindsIndex 数据爬取脚本

用法：
  python scripts/scrape-findsindex.py

依赖：
  pip install requests beautifulsoup4

注意：
  1. 请控制爬取频率，避免对目标网站造成压力
  2. 仅用于学习和个人项目
  3. 遵守目标网站的 robots.txt
"""

import requests
import json
import time
import os
from typing import List, Dict, Any
from datetime import datetime

# 配置
BASE_URL = "https://findsindex.com"
API_URL = "https://api.findsindex.com"
OUTPUT_DIR = "data/scraped"
DELAY_BETWEEN_REQUESTS = 1  # 秒

# 创建输出目录
os.makedirs(OUTPUT_DIR, exist_ok=True)


def fetch_categories() -> List[Dict[str, Any]]:
    """获取分类数据"""
    print("正在获取分类数据...")
    
    # 从首页或分类页提取分类数据
    # 这里需要根据实际网站结构调整
    response = requests.get(f"{BASE_URL}/en/categories", timeout=30)
    
    if response.status_code != 200:
        print(f"获取分类失败：{response.status_code}")
        return []
    
    # 解析 HTML 或使用 API
    # 这里假设网站有公开的 API
    categories = []
    
    # 保存到文件
    with open(f"{OUTPUT_DIR}/categories.json", "w", encoding="utf-8") as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)
    
    print(f"获取到 {len(categories)} 个分类")
    return categories


def fetch_brands() -> List[Dict[str, Any]]:
    """获取品牌数据"""
    print("正在获取品牌数据...")
    
    brands = []
    
    # 保存到文件
    with open(f"{OUTPUT_DIR}/brands.json", "w", encoding="utf-8") as f:
        json.dump(brands, f, ensure_ascii=False, indent=2)
    
    print(f"获取到 {len(brands)} 个品牌")
    return brands


def fetch_products(category_slug: str = None, page: int = 1) -> List[Dict[str, Any]]:
    """获取商品数据"""
    print(f"正在获取商品数据 (分类：{category_slug}, 页码：{page})...")
    
    products = []
    
    # 构建 API URL
    url = f"{BASE_URL}/en/api/products"
    params = {"page": page}
    if category_slug:
        params["category"] = category_slug
    
    try:
        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200:
            data = response.json()
            products = data.get("data", [])
    except Exception as e:
        print(f"获取商品失败：{e}")
    
    return products


def fetch_all_products():
    """获取所有商品数据"""
    print("开始获取所有商品...")
    
    all_products = []
    page = 1
    max_pages = 100  # 限制最大页数
    
    while page <= max_pages:
        products = fetch_products(page=page)
        
        if not products:
            print(f"第 {page} 页没有数据，停止爬取")
            break
        
        all_products.extend(products)
        print(f"已获取 {len(all_products)} 个商品")
        
        # 保存到文件（每页保存一次，防止中断丢失）
        with open(f"{OUTPUT_DIR}/products_page_{page}.json", "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        page += 1
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    # 合并所有商品
    with open(f"{OUTPUT_DIR}/products_all.json", "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    
    print(f"总共获取到 {len(all_products)} 个商品")
    return all_products


def transform_product(product: Dict[str, Any]) -> Dict[str, Any]:
    """转换商品数据格式以匹配 Prisma schema"""
    return {
        "id": product.get("id"),
        "slug": product.get("slug"),
        "title": product.get("title"),
        "titleEn": product.get("title"),
        "description": product.get("description"),
        "priceMin": product.get("priceMin", 0),
        "priceMax": product.get("priceMax", 0),
        "currency": product.get("currency", "CNY"),
        "mainImage": product.get("mainImage"),
        "images": product.get("images", []),
        "status": "active" if product.get("status") == "active" else "inactive",
        "isFeatured": product.get("isFeatured", False),
        "brandId": product.get("brandId"),
        "primaryCategoryId": product.get("primaryCategoryId"),
        "viewCount": product.get("viewCount", 0),
        "salesCount": product.get("salesCount", 0),
        "popularityScore": product.get("popularityScore", 0),
        "ctr": product.get("ctr", 0),
    }


def main():
    """主函数"""
    print("=" * 50)
    print("FindsIndex 数据爬取脚本")
    print("=" * 50)
    print(f"开始时间：{datetime.now()}")
    print()
    
    try:
        # 1. 获取分类
        categories = fetch_categories()
        time.sleep(DELAY_BETWEEN_REQUESTS)
        
        # 2. 获取品牌
        brands = fetch_brands()
        time.sleep(DELAY_BETWEEN_REQUESTS)
        
        # 3. 获取商品
        products = fetch_all_products()
        
        # 4. 转换数据格式
        transformed_products = [transform_product(p) for p in products]
        
        with open(f"{OUTPUT_DIR}/products_transformed.json", "w", encoding="utf-8") as f:
            json.dump(transformed_products, f, ensure_ascii=False, indent=2)
        
        print()
        print("=" * 50)
        print("爬取完成！")
        print(f"结束时间：{datetime.now()}")
        print(f"数据保存在：{OUTPUT_DIR}/")
        print("=" * 50)
        
    except KeyboardInterrupt:
        print("\n用户中断爬取")
    except Exception as e:
        print(f"\n爬取失败：{e}")


if __name__ == "__main__":
    main()
