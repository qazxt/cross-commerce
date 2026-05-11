/**
 * FindsIndex Mock Data Generator
 * 
 * Usage: npx tsx scripts/seed-mock-data.ts
 * 
 * 生成代购导航网站的模拟数据
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ========== 图片占位 ==========
// 使用 picsum.photos 作为占位图，也可以用真实商品图
const IMAGE_BASE = 'https://picsum.photos/seed';

// ========== 分类数据（带子分类） ==========
const categoryData = [
  {
    name: '女装', nameEn: "Women's Clothing", slug: 'womens-clothing',
    children: [
      { name: '连衣裙', nameEn: 'Dresses', slug: 'dresses' },
      { name: 'T恤', nameEn: 'T-Shirts', slug: 'tshirts' },
      { name: '卫衣', nameEn: 'Hoodies', slug: 'hoodies' },
      { name: '牛仔裤', nameEn: 'Jeans', slug: 'jeans' },
      { name: '半身裙', nameEn: 'Skirts', slug: 'skirts' },
      { name: '外套', nameEn: 'Jackets', slug: 'jackets' },
    ],
  },
  {
    name: '男装', nameEn: "Men's Clothing", slug: 'mens-clothing',
    children: [
      { name: 'T恤', nameEn: 'T-Shirts', slug: 'men-tshirts' },
      { name: '卫衣', nameEn: 'Hoodies', slug: 'men-hoodies' },
      { name: '牛仔裤', nameEn: 'Jeans', slug: 'men-jeans' },
      { name: '衬衫', nameEn: 'Shirts', slug: 'shirts' },
      { name: '短裤', nameEn: 'Shorts', slug: 'shorts' },
      { name: '外套', nameEn: 'Jackets', slug: 'men-jackets' },
    ],
  },
  {
    name: '鞋靴', nameEn: 'Shoes & Boots', slug: 'shoes',
    children: [
      { name: '运动鞋', nameEn: 'Sneakers', slug: 'sneakers' },
      { name: '帆布鞋', nameEn: 'Canvas Shoes', slug: 'canvas-shoes' },
      { name: '靴子', nameEn: 'Boots', slug: 'boots' },
      { name: '凉鞋', nameEn: 'Sandals', slug: 'sandals' },
      { name: '拖鞋', nameEn: 'Slippers', slug: 'slippers' },
    ],
  },
  {
    name: '箱包配饰', nameEn: 'Bags & Accessories', slug: 'bags-accessories',
    children: [
      { name: '双肩包', nameEn: 'Backpacks', slug: 'backpacks' },
      { name: '单肩包', nameEn: 'Shoulder Bags', slug: 'shoulder-bags' },
      { name: '斜挎包', nameEn: 'Crossbody Bags', slug: 'crossbody-bags' },
      { name: '帽子', nameEn: 'Hats', slug: 'hats' },
      { name: '围巾', nameEn: 'Scarves', slug: 'scarves' },
    ],
  },
  {
    name: '运动户外', nameEn: 'Sports & Outdoors', slug: 'sports-outdoors',
    children: [
      { name: '运动套装', nameEn: 'Tracksuits', slug: 'tracksuits' },
      { name: '瑜伽服', nameEn: 'Yoga Wear', slug: 'yoga-wear' },
      { name: '冲锋衣', nameEn: 'Windbreakers', slug: 'windbreakers' },
      { name: '运动配件', nameEn: 'Sports Accessories', slug: 'sports-accessories' },
    ],
  },
  {
    name: '美妆护肤', nameEn: 'Beauty & Skincare', slug: 'beauty',
    children: [
      { name: '面膜', nameEn: 'Face Masks', slug: 'face-masks' },
      { name: '口红', nameEn: 'Lipstick', slug: 'lipstick' },
      { name: '粉底', nameEn: 'Foundation', slug: 'foundation' },
      { name: '护肤套装', nameEn: 'Skincare Sets', slug: 'skincare-sets' },
    ],
  },
];

// ========== 品牌数据 ==========
const brandData = [
  { name: 'Uniqlo', nameCn: '优衣库', slug: 'uniqlo', description: 'LifeWear 服适人生 - 日本快时尚品牌' },
  { name: 'Nike', nameCn: '耐克', slug: 'nike', description: 'Just Do It - 全球领先的运动品牌' },
  { name: 'Adidas', nameCn: '阿迪达斯', slug: 'adidas', description: 'Impossible is Nothing - 德国运动品牌' },
  { name: 'Champion', nameCn: '冠军', slug: 'champion', description: '美国经典运动休闲品牌，始于1919年' },
  { name: 'The North Face', nameCn: '北面', slug: 'the-north-face', description: '专业户外运动装备品牌' },
  { name: 'Converse', nameCn: '匡威', slug: 'converse', description: 'All Star - 经典帆布鞋品牌' },
  { name: 'Vans', nameCn: '万斯', slug: 'vans', description: 'Off The Wall - 极限运动潮牌' },
  { name: 'Muji', nameCn: '无印良品', slug: 'muji', description: '简约自然，追求本质' },
  { name: 'Zara', nameCn: '飒拉', slug: 'zara', description: '西班牙快时尚品牌' },
  { name: 'H&M', nameCn: '海恩斯莫里斯', slug: 'hm', description: '瑞典快时尚品牌' },
  { name: 'New Balance', nameCn: '新百伦', slug: 'new-balance', description: '美国总统慢跑鞋' },
  { name: 'Puma', nameCn: '彪马', slug: 'puma', description: 'Forever Faster - 德国运动品牌' },
];

// ========== 商品模板（每个品牌x分类组合） ==========
interface ProductTemplate {
  title: string;
  titleEn: string;
  slug: string;
  priceMin: number;
  priceMax: number;
  descCn: string;
  descEn: string;
  featured?: boolean;
}

const productTemplates: Record<string, ProductTemplate[]> = {
  // 女装 - 连衣裙
  'womens-clothing.dresses': [
    { title: '法式复古碎花连衣裙', titleEn: 'French Vintage Floral Dress', slug: 'floral-dress', priceMin: 89, priceMax: 159, descCn: '法式复古风格，碎花印花，雪纺面料，收腰显瘦', descEn: 'French vintage style floral chiffon dress with cinched waist', featured: true },
    { title: '黑色小礼服连衣裙', titleEn: 'Little Black Dress', slug: 'black-dress', priceMin: 129, priceMax: 219, descCn: '经典小黑裙，修身剪裁，适合多种场合', descEn: 'Classic little black dress, slim fit, versatile' },
    { title: '日系甜美百褶裙', titleEn: 'Japanese Pleated Midi Dress', slug: 'pleated-midi', priceMin: 79, priceMax: 139, descCn: '日系甜美风格，百褶设计，飘逸舒适', descEn: 'Japanese sweet style with pleated design' },
    { title: '通勤职业连衣裙', titleEn: 'Office Lady Dress', slug: 'office-dress', priceMin: 119, priceMax: 199, descCn: '通勤职业装，简约大方，适合职场', descEn: 'Professional office dress, simple and elegant' },
    { title: '度假波西米亚长裙', titleEn: 'Bohemian Maxi Dress', slug: 'boho-maxi', priceMin: 99, priceMax: 179, descCn: '波西米亚风格，度假必备，飘逸舒适', descEn: 'Bohemian style maxi dress, perfect for vacation' },
  ],
  // 女装 - T恤
  'womens-clothing.tshirts': [
    { title: '基础款纯棉T恤', titleEn: 'Basic Cotton Tee', slug: 'basic-tee', priceMin: 39, priceMax: 69, descCn: '100%纯棉基础款T恤，百搭必备', descEn: '100% cotton basic tee, wardrobe essential', featured: true },
    { title: '字母印花宽松T恤', titleEn: 'Letter Print Oversized Tee', slug: 'letter-tee', priceMin: 49, priceMax: 89, descCn: '字母印花，宽松版型，街头风格', descEn: 'Letter print oversized tee, street style' },
    { title: '修身短款T恤', titleEn: 'Fitted Crop Tee', slug: 'crop-tee', priceMin: 35, priceMax: 59, descCn: '修身短款设计，展现腰线', descEn: 'Fitted crop design showing waistline' },
    { title: '条纹海魂衫T恤', titleEn: 'Striped Breton Tee', slug: 'striped-tee', priceMin: 45, priceMax: 79, descCn: '经典条纹海魂衫，法式风格', descEn: 'Classic striped Breton tee, French style' },
  ],
  // 男装 - T恤
  'mens-clothing.men-tshirts': [
    { title: '重磅纯棉T恤', titleEn: 'Heavyweight Cotton Tee', slug: 'heavy-tee', priceMin: 59, priceMax: 99, descCn: '280g重磅纯棉面料，质感厚实', descEn: '280g heavyweight cotton tee, premium quality', featured: true },
    { title: '运动速干T恤', titleEn: 'Sport Quick-Dry Tee', slug: 'dry-tee', priceMin: 49, priceMax: 89, descCn: '速干面料，运动必备', descEn: 'Quick-dry fabric, essential for sports' },
    { title: '复古水洗做旧T恤', titleEn: 'Vintage Washed Tee', slug: 'vintage-tee', priceMin: 69, priceMax: 119, descCn: '复古水洗工艺，做旧效果', descEn: 'Vintage wash finish, distressed look' },
    { title: 'POLO衫翻领T恤', titleEn: 'Polo Shirt', slug: 'polo', priceMin: 79, priceMax: 139, descCn: '经典POLO翻领设计，商务休闲', descEn: 'Classic polo collar design, business casual' },
  ],
  // 鞋靴 - 运动鞋
  'shoes.sneakers': [
    { title: '经典复古跑鞋', titleEn: 'Classic Retro Runner', slug: 'retro-runner', priceMin: 299, priceMax: 459, descCn: '经典复古跑鞋设计，缓震中底', descEn: 'Classic retro runner with cushioned midsole', featured: true },
    { title: '气垫篮球鞋', titleEn: 'Air Cushion Basketball Shoe', slug: 'air-basketball', priceMin: 459, priceMax: 699, descCn: '全掌气垫，篮球实战利器', descEn: 'Full-length air cushion for basketball performance' },
    { title: '轻量飞织跑鞋', titleEn: 'Flyknit Lightweight Runner', slug: 'flyknit-runner', priceMin: 359, priceMax: 559, descCn: '飞织鞋面，超轻透气', descEn: 'Flyknit upper, ultra-light and breathable' },
    { title: '厚底老爹鞋', titleEn: 'Chunky Sneakers', slug: 'chunky-sneaker', priceMin: 279, priceMax: 439, descCn: '厚底增高设计，潮流百搭', descEn: 'Platform sole for height boost, trendy and versatile' },
    { title: '网面透气跑鞋', titleEn: 'Mesh Breathable Runner', slug: 'mesh-runner', priceMin: 239, priceMax: 379, descCn: '网面透气鞋面，适合夏季', descEn: 'Mesh breathable upper, ideal for summer' },
  ],
  // 鞋靴 - 帆布鞋
  'shoes.canvas-shoes': [
    { title: '经典高帮帆布鞋', titleEn: 'Classic High-Top Canvas', slug: 'high-top-canvas', priceMin: 189, priceMax: 289, descCn: '经典高帮帆布鞋，百搭之王', descEn: 'Classic high-top canvas, the ultimate versatile shoe', featured: true },
    { title: '低帮帆布鞋', titleEn: 'Low-Top Canvas', slug: 'low-top-canvas', priceMin: 159, priceMax: 249, descCn: '低帮帆布鞋，简约百搭', descEn: 'Low-top canvas, simple and versatile' },
    { title: '印花帆布鞋', titleEn: 'Printed Canvas Sneakers', slug: 'printed-canvas', priceMin: 199, priceMax: 319, descCn: '个性印花帆布鞋，独特风格', descEn: 'Unique printed canvas sneakers' },
  ],
  // 男装 - 卫衣
  'mens-clothing.men-hoodies': [
    { title: '经典连帽卫衣', titleEn: 'Classic Pullover Hoodie', slug: 'pullover-hoodie', priceMin: 119, priceMax: 199, descCn: '经典连帽卫衣，加绒保暖', descEn: 'Classic pullover hoodie with fleece lining', featured: true },
    { title: '拉链开衫卫衣', titleEn: 'Zip-Up Hoodie', slug: 'zip-hoodie', priceMin: 139, priceMax: 229, descCn: '拉链开衫款式，穿脱方便', descEn: 'Zip-up hoodie for easy on-off' },
    { title: '印花图案卫衣', titleEn: 'Graphic Hoodie', slug: 'graphic-hoodie', priceMin: 129, priceMax: 209, descCn: '个性印花图案，街头风格', descEn: 'Graphic print hoodie, street style' },
    { title: '拼接撞色卫衣', titleEn: 'Color Block Hoodie', slug: 'colorblock-hoodie', priceMin: 149, priceMax: 239, descCn: '拼接撞色设计，时尚感强', descEn: 'Color block design, fashion-forward' },
  ],
  // 箱包 - 双肩包
  'bags-accessories.backpacks': [
    { title: '大容量商务双肩包', titleEn: 'Business Laptop Backpack', slug: 'laptop-backpack', priceMin: 159, priceMax: 279, descCn: '大容量设计，可放15寸笔记本', descEn: 'Large capacity, fits 15" laptop', featured: true },
    { title: '休闲帆布双肩包', titleEn: 'Canvas Casual Backpack', slug: 'canvas-backpack', priceMin: 89, priceMax: 159, descCn: '帆布材质，休闲百搭', descEn: 'Canvas material, casual and versatile' },
    { title: '防水运动双肩包', titleEn: 'Waterproof Sport Backpack', slug: 'sport-backpack', priceMin: 129, priceMax: 219, descCn: '防水面料，适合户外运动', descEn: 'Waterproof fabric for outdoor sports' },
  ],
  // 美妆 - 面膜
  'beauty.face-masks': [
    { title: '玻尿酸补水面膜', titleEn: 'Hyaluronic Acid Hydrating Mask', slug: 'hydra-mask', priceMin: 49, priceMax: 99, descCn: '玻尿酸深层补水，保湿修护', descEn: 'Hyaluronic acid deep hydration mask', featured: true },
    { title: '胶原蛋白紧致面膜', titleEn: 'Collagen Firming Mask', slug: 'collagen-mask', priceMin: 69, priceMax: 129, descCn: '胶原蛋白紧致肌肤，抗皱抗衰', descEn: 'Collagen firming and anti-wrinkle mask' },
    { title: '烟酰胺美白面膜', titleEn: 'Niacinamide Brightening Mask', slug: 'brightening-mask', priceMin: 59, priceMax: 109, descCn: '烟酰胺美白成分，提亮肤色', descEn: 'Niacinamide brightening mask' },
  ],
};

// ========== 生成 SKU ==========
function generateSkus(productId: string, priceMin: number) {
  const colors = ['黑色', '白色', '灰色'];
  const sizes = ['S', 'M', 'L', 'XL'];

  const skus = [];
  for (const color of colors) {
    for (const size of sizes) {
      const priceDelta = sizes.indexOf(size) * 10;
      skus.push({
        productId,
        name: `${color} / ${size}`,
        price: priceMin + priceDelta,
        stock: Math.floor(Math.random() * 200) + 50,
        options: JSON.stringify({ color, size }),
      });
    }
  }
  return skus;
}

// ========== 生成联盟链接 ==========
function generateAffiliateLinks(productId: string, productSlug: string, platforms: string[]) {
  const links = [];
  const selected = [...platforms].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3));

  for (let i = 0; i < selected.length; i++) {
    const platform = selected[i];
    const platformSlug = platform.toLowerCase();
    links.push({
      productId,
      platform,
      platformUrl: `https://item.taobao.com/item.htm?id=${1000000000 + Math.floor(Math.random() * 9000000000)}`,
      affiliateUrl: `https://${platformSlug}.com/product/${productSlug}?ref=aff_${productId.slice(0, 8)}`,
      isPrimary: i === 0,
      isActive: true,
      clickCount: Math.floor(Math.random() * 1000),
      conversionRate: Math.round(Math.random() * 500) / 100,
    });
  }
  return links;
}

// ========== 主函数 ==========
async function main() {
  console.log('🌱 开始生成 FindsIndex 模拟数据...\n');

  // 清空
  console.log('🧹 清空现有数据...');
  await prisma.productSKU.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.affiliateLink.deleteMany();
  await prisma.userBehavior.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.categoryProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  console.log('   ✅ 清空完成\n');

  // 1. 创建分类
  console.log('📂 创建分类...');
  const categoryMap: Record<string, any> = {};

  for (let i = 0; i < categoryData.length; i++) {
    const cat = categoryData[i];
    const parent = await prisma.category.create({
      data: {
        name: cat.name, nameEn: cat.nameEn, slug: cat.slug,
        level: 0, sortOrder: i, isActive: true,
      },
    });
    categoryMap[cat.slug] = parent;

    for (let j = 0; j < cat.children.length; j++) {
      const child = cat.children[j];
      const childCat = await prisma.category.create({
        data: {
          name: child.name, nameEn: child.nameEn, slug: child.slug,
          level: 1, parentId: parent.id, sortOrder: j, isActive: true,
        },
      });
      categoryMap[child.slug] = childCat;
    }
  }
  console.log(`   ✅ ${Object.keys(categoryMap).length} 个分类\n`);

  // 2. 创建品牌
  console.log('🏷️  创建品牌...');
  const brandMap: Record<string, any> = {};

  for (const b of brandData) {
    const brand = await prisma.brand.create({
      data: {
        name: b.name, nameCn: b.nameCn, slug: b.slug,
        description: b.description,
        logoUrl: `https://logo.clearbit.com/${b.slug}.com`,
      },
    });
    brandMap[b.slug] = brand;
  }
  console.log(`   ✅ ${Object.keys(brandMap).length} 个品牌\n`);

  // 3. 创建商品
  console.log('📦 创建商品...');
  const PLATFORMS = ['Kakobuy', 'CNFans', 'ACBuy', 'Sugargoo', 'Superbuy', 'Pandabuy', 'Wegobuy', 'CSSBuy'];

  // 品牌-分类-模板组合
  const combos = [
    { cat: 'dresses', brand: 'uniqlo', templates: productTemplates['womens-clothing.dresses'] },
    { cat: 'tshirts', brand: 'uniqlo', templates: productTemplates['womens-clothing.tshirts'] },
    { cat: 'men-tshirts', brand: 'uniqlo', templates: productTemplates['mens-clothing.men-tshirts'] },
    { cat: 'men-hoodies', brand: 'champion', templates: productTemplates['mens-clothing.men-hoodies'] },
    { cat: 'sneakers', brand: 'nike', templates: productTemplates['shoes.sneakers'] },
    { cat: 'canvas-shoes', brand: 'converse', templates: productTemplates['shoes.canvas-shoes'] },
    { cat: 'backpacks', brand: 'new-balance', templates: productTemplates['bags-accessories.backpacks'] },
    { cat: 'face-masks', brand: 'muji', templates: productTemplates['beauty.face-masks'] },
  ];

  let totalProducts = 0;
  let totalSkus = 0;
  let totalLinks = 0;

  for (const combo of combos) {
    const brand = brandMap[combo.brand];
    const category = categoryMap[combo.cat];
    const templates = combo.templates || [];

    if (!brand || !category) continue;

    for (let t = 0; t < templates.length; t++) {
      const tpl = templates[t];
      const seed = `${brand.slug}-${tpl.slug}-${t}`;

      const product = await prisma.product.create({
        data: {
          title: tpl.title,
          titleEn: tpl.titleEn,
          slug: `${brand.slug}-${tpl.slug}-${t + 1}`,
          priceMin: tpl.priceMin,
          priceMax: tpl.priceMax,
          currency: 'CNY',
          mainImage: `${IMAGE_BASE}/${seed}/800/800`,
          images: JSON.stringify([
            `${IMAGE_BASE}/${seed}-1/800/800`,
            `${IMAGE_BASE}/${seed}-2/800/800`,
            `${IMAGE_BASE}/${seed}-3/800/800`,
          ]),
          description: tpl.descEn,
          descriptionCn: tpl.descCn,
          status: 'active',
          isFeatured: tpl.featured || false,
          brandId: brand.id,
          primaryCategoryId: category.id,
          viewCount: Math.floor(Math.random() * 5000) + 100,
          salesCount: Math.floor(Math.random() * 500) + 10,
          popularityScore: Math.round(Math.random() * 100) / 100,
          ctr: Math.round(Math.random() * 1000) / 10000,
        },
      });

      totalProducts++;

      // SKU
      const skus = generateSkus(product.id, tpl.priceMin);
      for (const sku of skus) {
        await prisma.productSKU.create({ data: sku });
      }
      totalSkus += skus.length;

      // 属性
      const attrs = [
        { productId: product.id, name: '材质', value: '纯棉/涤纶混纺', type: 'text' },
        { productId: product.id, name: '产地', value: '中国', type: 'text' },
        { productId: product.id, name: '适用季节', value: '四季通用', type: 'text' },
        { productId: product.id, name: '洗涤方式', value: '机洗/冷水', type: 'text' },
      ];
      for (const attr of attrs) {
        await prisma.productAttribute.create({ data: attr });
      }

      // 联盟链接
      const links = generateAffiliateLinks(product.id, product.slug, PLATFORMS);
      for (const link of links) {
        await prisma.affiliateLink.create({ data: link });
      }
      totalLinks += links.length;
    }
  }

  console.log(`   ✅ ${totalProducts} 个商品`);
  console.log(`   ✅ ${totalSkus} 个 SKU`);
  console.log(`   ✅ ${totalLinks} 条联盟链接\n`);

  // 4. 管理员用户
  console.log('👤 创建管理员...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: '管理员',
      email: 'admin@findsindex.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  });
  console.log('   ✅ admin@findsindex.com / admin123\n');

  // 5. 统计
  const [cats, brs, prods, skus, links] = await Promise.all([
    prisma.category.count(),
    prisma.brand.count(),
    prisma.product.count(),
    prisma.productSKU.count(),
    prisma.affiliateLink.count(),
  ]);

  console.log('📊 数据统计:');
  console.log(`   分类: ${cats} | 品牌: ${brs} | 商品: ${prods} | SKU: ${skus} | 联盟链接: ${links}`);
  console.log('\n🎉 数据生成完成！');
}

main()
  .catch((e) => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
