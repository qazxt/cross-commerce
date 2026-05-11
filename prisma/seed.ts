import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始导入种子数据...');

  // 清理现有数据
  console.log('🗑️  清理现有数据...');
  await prisma.productSKU.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.affiliateLink.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ 清理完成');

  // 1. 创建分类
  const clothing = await prisma.category.create({
    data: {
      name: '服装',
      nameEn: 'Clothing',
      slug: 'clothing',
      level: 0,
      sortOrder: 1,
      isActive: true,
    },
  });

  const shoes = await prisma.category.create({
    data: {
      name: '鞋靴',
      nameEn: 'Shoes',
      slug: 'shoes',
      level: 0,
      sortOrder: 2,
      isActive: true,
    },
  });

  const bags = await prisma.category.create({
    data: {
      name: '箱包',
      nameEn: 'Bags',
      slug: 'bags',
      level: 0,
      sortOrder: 3,
      isActive: true,
    },
  });

  console.log('✅ 分类创建完成');

  // 2. 创建品牌
  const nike = await prisma.brand.create({
    data: {
      name: 'Nike',
      slug: 'nike',
    },
  });

  const adidas = await prisma.brand.create({
    data: {
      name: 'Adidas',
      slug: 'adidas',
    },
  });

  const gucci = await prisma.brand.create({
    data: {
      name: 'Gucci',
      slug: 'gucci',
    },
  });

  console.log('✅ 品牌创建完成');

  // 3. 创建测试商品（带 SKU 和多张图片）
  const products = [
    {
      title: 'Nike Air Max 90 运动鞋',
      slug: 'nike-air-max-90',
      priceMin: 59900,
      priceMax: 69900,
      mainImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500',
        'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500',
        'https://images.unsplash.com/photo-1600185365483-26d7a092484d?w=500',
      ]),
      description: '经典 Nike Air Max 90 运动鞋，采用优质皮革和网眼材质，提供出色的缓震和舒适性。适合日常穿着和运动。',
      brandId: nike.id,
      primaryCategoryId: shoes.id,
      skus: [
        { name: 'White / US 7', price: 59900, stock: 10, options: { color: 'White', size: 'US 7' } },
        { name: 'White / US 8', price: 59900, stock: 15, options: { color: 'White', size: 'US 8' } },
        { name: 'White / US 9', price: 59900, stock: 20, options: { color: 'White', size: 'US 9' } },
        { name: 'Black / US 7', price: 59900, stock: 8, options: { color: 'Black', size: 'US 7' } },
        { name: 'Black / US 8', price: 59900, stock: 12, options: { color: 'Black', size: 'US 8' } },
        { name: 'Black / US 9', price: 59900, stock: 18, options: { color: 'Black', size: 'US 9' } },
        { name: 'Red / US 8', price: 69900, stock: 5, options: { color: 'Red', size: 'US 8' } },
        { name: 'Red / US 9', price: 69900, stock: 7, options: { color: 'Red', size: 'US 9' } },
      ],
    },
    {
      title: 'Adidas Ultraboost 跑步鞋',
      slug: 'adidas-ultraboost',
      priceMin: 69900,
      priceMax: 79900,
      mainImage: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
        'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=500',
      ]),
      description: 'Adidas Ultraboost 跑步鞋，采用 Boost 缓震技术，提供卓越的能量回馈和舒适性。适合长跑和日常训练。',
      brandId: adidas.id,
      primaryCategoryId: shoes.id,
      skus: [
        { name: 'Core Black / 40', price: 69900, stock: 10, options: { color: 'Core Black', size: '40' } },
        { name: 'Core Black / 41', price: 69900, stock: 15, options: { color: 'Core Black', size: '41' } },
        { name: 'Core Black / 42', price: 69900, stock: 20, options: { color: 'Core Black', size: '42' } },
        { name: 'Cloud White / 40', price: 69900, stock: 8, options: { color: 'Cloud White', size: '40' } },
        { name: 'Cloud White / 41', price: 69900, stock: 12, options: { color: 'Cloud White', size: '41' } },
        { name: 'Cloud White / 42', price: 69900, stock: 18, options: { color: 'Cloud White', size: '42' } },
      ],
    },
    {
      title: 'Gucci 经典帆布包',
      slug: 'gucci-canvas-bag',
      priceMin: 89900,
      priceMax: 99900,
      mainImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500',
        'https://images.unsplash.com/photo-1566150905458-1bf1dad1db56?w=500',
      ]),
      description: 'Gucci 经典帆布包，采用优质帆布和皮革制成，经典双 G 标志设计。适合日常使用和旅行。',
      brandId: gucci.id,
      primaryCategoryId: bags.id,
      skus: [
        { name: 'Beige / Small', price: 89900, stock: 5, options: { color: 'Beige', size: 'Small' } },
        { name: 'Beige / Medium', price: 99900, stock: 8, options: { color: 'Beige', size: 'Medium' } },
        { name: 'Black / Small', price: 89900, stock: 6, options: { color: 'Black', size: 'Small' } },
        { name: 'Black / Medium', price: 99900, stock: 10, options: { color: 'Black', size: 'Medium' } },
      ],
    },
    {
      title: 'Nike 运动 T 恤',
      slug: 'nike-sport-tshirt',
      priceMin: 19900,
      priceMax: 24900,
      mainImage: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
        'https://images.unsplash.com/photo-1583743814966-8936f5b56149?w=500',
      ]),
      description: 'Nike 运动 T 恤，采用 Dri-FIT 技术，吸湿排汗，保持干爽舒适。适合运动和日常穿着。',
      brandId: nike.id,
      primaryCategoryId: clothing.id,
      skus: [
        { name: 'Black / S', price: 19900, stock: 20, options: { color: 'Black', size: 'S' } },
        { name: 'Black / M', price: 19900, stock: 30, options: { color: 'Black', size: 'M' } },
        { name: 'Black / L', price: 19900, stock: 25, options: { color: 'Black', size: 'L' } },
        { name: 'White / S', price: 19900, stock: 15, options: { color: 'White', size: 'S' } },
        { name: 'White / M', price: 19900, stock: 25, options: { color: 'White', size: 'M' } },
        { name: 'White / L', price: 19900, stock: 20, options: { color: 'White', size: 'L' } },
        { name: 'Red / M', price: 24900, stock: 10, options: { color: 'Red', size: 'M' } },
        { name: 'Red / L', price: 24900, stock: 12, options: { color: 'Red', size: 'L' } },
      ],
    },
  ];

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: {
        title: product.title,
        slug: product.slug,
        priceMin: product.priceMin,
        priceMax: product.priceMax || product.priceMin,
        mainImage: product.mainImage,
        images: product.images || '[]',
        description: product.description,
        brandId: product.brandId,
        primaryCategoryId: product.primaryCategoryId,
        status: 'active',
      },
    });

    // 创建 SKU
    if (product.skus) {
      for (const sku of product.skus) {
        await prisma.productSKU.create({
          data: {
            productId: createdProduct.id,
            name: sku.name,
            price: sku.price,
            stock: sku.stock,
            options: JSON.stringify(sku.options),
          },
        });
      }
    }
  }

  console.log('✅ 商品创建完成');
  console.log('🎉 种子数据导入完成！');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
