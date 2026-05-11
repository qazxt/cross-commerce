/**
 * SEO 功能验证脚本
 * 
 * 使用方法：
 * npx tsx scripts/test-seo.ts
 */

const SITE_URL = 'http://47.108.119.210:3000';

async function testSeo() {
  console.log('🧪 SEO 功能验证\n');

  const results: { name: string; status: '✅' | '❌'; details: string }[] = [];

  // 测试 1: 检查 robots.txt
  console.log('📊 测试 1: robots.txt');
  try {
    const res = await fetch(`${SITE_URL}/robots.txt`);
    if (res.ok) {
      const text = await res.text();
      results.push({
        name: 'robots.txt',
        status: text.includes('Sitemap') ? '✅' : '⚠️',
        details: text.includes('Sitemap') ? '包含 Sitemap 链接' : '缺少 Sitemap',
      });
    } else {
      results.push({ name: 'robots.txt', status: '❌', details: `HTTP ${res.status}` });
    }
  } catch (e: any) {
    results.push({ name: 'robots.txt', status: '❌', details: e.message });
  }

  // 测试 2: 检查 sitemap.xml
  console.log('📊 测试 2: sitemap.xml');
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`);
    if (res.ok) {
      const text = await res.text();
      const urlCount = (text.match(/<loc>/g) || []).length;
      results.push({
        name: 'sitemap.xml',
        status: urlCount > 0 ? '✅' : '❌',
        details: `包含 ${urlCount} 个 URL`,
      });
    } else {
      results.push({ name: 'sitemap.xml', status: '❌', details: `HTTP ${res.status}` });
    }
  } catch (e: any) {
    results.push({ name: 'sitemap.xml', status: '❌', details: e.message });
  }

  // 测试 3: 检查语言版本 sitemap
  console.log('📊 测试 3: 多语言 Sitemap');
  try {
    const [zhRes, enRes] = await Promise.all([
      fetch(`${SITE_URL}/zh/sitemap.xml`),
      fetch(`${SITE_URL}/en/sitemap.xml`),
    ]);
    const zhOk = zhRes.ok;
    const enOk = enRes.ok;
    results.push({
      name: '多语言 Sitemap',
      status: zhOk && enOk ? '✅' : '❌',
      details: `中文: ${zhOk ? 'OK' : 'Fail'}, 英文: ${enOk ? 'OK' : 'Fail'}`,
    });
  } catch (e: any) {
    results.push({ name: '多语言 Sitemap', status: '❌', details: e.message });
  }

  // 测试 4: 检查商品页面元数据
  console.log('📊 测试 4: 商品页面 SEO');
  try {
    const res = await fetch(`${SITE_URL}/zh/product/nike-sweatpants-e1e1bm`);
    if (res.ok) {
      const html = await res.text();
      const hasOgTitle = html.includes('property="og:title"');
      const hasOgDesc = html.includes('property="og:description"');
      const hasOgImage = html.includes('property="og:image"');
      const hasSchema = html.includes('application/ld+json');
      
      results.push({
        name: '商品页面 SEO',
        status: hasOgTitle && hasOgDesc ? '✅' : '⚠️',
        details: `OG: ${hasOgTitle ? '✓' : '✗'} 描述: ${hasOgDesc ? '✓' : '✗'} 图片: ${hasOgImage ? '✓' : '✗'} Schema: ${hasSchema ? '✓' : '✗'}`,
      });
    } else {
      results.push({ name: '商品页面 SEO', status: '❌', details: `HTTP ${res.status}` });
    }
  } catch (e: any) {
    results.push({ name: '商品页面 SEO', status: '❌', details: e.message });
  }

  // 测试 5: 检查首页元数据
  console.log('📊 测试 5: 首页 SEO');
  try {
    const res = await fetch(`${SITE_URL}/zh`);
    if (res.ok) {
      const html = await res.text();
      const hasTitle = html.includes('<title>');
      const hasMetaDesc = html.includes('name="description"');
      const hasCanonical = html.includes('rel="canonical"');
      
      results.push({
        name: '首页 SEO',
        status: hasTitle && hasMetaDesc ? '✅' : '⚠️',
        details: `Title: ${hasTitle ? '✓' : '✗'} Description: ${hasMetaDesc ? '✓' : '✗'} Canonical: ${hasCanonical ? '✓' : '✗'}`,
      });
    } else {
      results.push({ name: '首页 SEO', status: '❌', details: `HTTP ${res.status}` });
    }
  } catch (e: any) {
    results.push({ name: '首页 SEO', status: '❌', details: e.message });
  }

  // 测试 6: 检查 404 页面
  console.log('📊 测试 6: 404 页面');
  try {
    const res = await fetch(`${SITE_URL}/zh/not-exist-page-12345`);
    const text = await res.text();
    const hasCustom404 = text.includes('页面未找到') || text.includes('NotFound');
    results.push({
      name: '404 页面',
      status: hasCustom404 ? '✅' : '⚠️',
      details: hasCustom404 ? '有自定义 404 页面' : '使用默认 404',
    });
  } catch (e: any) {
    results.push({ name: '404 页面', status: '❌', details: e.message });
  }

  // 输出结果
  console.log('\n📋 测试结果:\n');
  console.log('| 检查项 | 状态 | 详情 |');
  console.log('|--------|------|------|');
  for (const r of results) {
    console.log(`| ${r.name} | ${r.status} | ${r.details} |`);
  }

  const passed = results.filter(r => r.status === '✅').length;
  const total = results.length;
  console.log(`\n✅ 通过: ${passed}/${total}`);

  if (passed === total) {
    console.log('🎉 所有 SEO 检查通过！');
  } else {
    console.log('⚠️ 部分检查未通过，请检查上述问题。');
  }
}

testSeo().catch(console.error);