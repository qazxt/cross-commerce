# 代购平台联盟账号申请指南

**日期**: 2026-04-16  
**状态**: 待执行

---

## 📝 申请清单

### 第一阶段：主流平台（优先申请）

| 平台 | 申请链接 | 状态 | affiliate_id | 备注 |
|------|----------|------|--------------|------|
| **Kakobuy** | kakobuy.com/affiliate | ⏸️ 待申请 | - | 主推平台 |
| **CNFans** | cnfans.com/affiliate | ⏸️ 待申请 | - | 老牌平台 |
| **ACBuy** | acbuy.com/page/affiliate | ⏸️ 待申请 | - | 价格透明 |
| **Sugargoo** | sugargoo.com/affiliate | ⏸️ 待申请 | - | 新兴平台 |
| **Superbuy** | superbuy.com/affiliate | ⏸️ 待申请 | - | 规模最大 |

### 第二阶段：其他平台（后续申请）

| 平台 | 申请链接 | 状态 | affiliate_id |
|------|----------|------|--------------|
| **Pandabuy** | pandabuy.com/affiliate | ⏸️ 待申请 | - |
| **Wegobuy** | wegobuy.com/affiliate | ⏸️ 待申请 | - |
| **CSSBuy** | cssbuy.com/affiliate | ⏸️ 待申请 | - |
| **Ytaopal** | ytaopal.com/affiliate | ⏸️ 待申请 | - |
| **8Buy** | 8buy.com/affiliate | ⏸️ 待申请 | - |

---

## 📧 申请邮件模板

### 英文模板（推荐）

```
Subject: Affiliate Program Application - FindsIndex.com

Dear [Platform Name] Affiliate Team,

I am writing to apply for your affiliate program on behalf of FindsIndex 
(https://findsindex.com).

About FindsIndex:
- Product discovery and comparison website
- Target audience: Global shoppers interested in Chinese products
- Monthly traffic: [预计流量，如 10,000+ visitors]
- Marketing channels: SEO, Social Media, Content Marketing

We are interested in promoting [Platform Name] to our users through:
- Product page affiliate links
- Comparison pages
- Dedicated landing pages

Could you please provide:
1. Your affiliate program commission rates
2. Cookie duration
3. Payment methods and threshold
4. API access (if available)
5. Creative assets (banners, logos)

We look forward to a mutually beneficial partnership.

Best regards,
[Your Name]
Founder, FindsIndex
Email: [your email]
Website: https://findsindex.com
```

### 中文模板

```
主题：联盟计划申请 - FindsIndex.com

尊敬的 [平台名称] 联盟团队：

您好！我代表 FindsIndex (https://findsindex.com) 申请加入贵平台的联盟计划。

关于 FindsIndex：
- 商品发现和比价网站
- 目标用户：对国货感兴趣的全球购物者
- 月流量：[预计流量，如 10,000+ 访客]
- 推广渠道：SEO、社交媒体、内容营销

我们计划通过以下方式推广 [平台名称]：
- 商品页联盟链接
- 比价页面
- 专属落地页

请提供以下信息：
1. 联盟佣金率
2. Cookie 有效期
3. 支付方式和最低提现金额
4. API 接入（如有）
5. 推广素材（横幅、Logo）

期待与贵平台建立长期合作关系。

此致
敬礼

[您的姓名]
创始人，FindsIndex
邮箱：[您的邮箱]
网站：https://findsindex.com
```

---

## 🔧 配置模板

### 获得 affiliate_id 后更新

**文件**: `scripts/config.js`

```javascript
module.exports = {
  AFFILIATE_CONFIG: {
    affiliateId: 'findsindex_real', // 替换为真实 ID
    
    platforms: [
      {
        name: 'Kakobuy',
        affiliateId: 'findsindex_kakobuy', // Kakobuy 专属 ID
        commissionRate: 0.03,
        cookieDays: 30,
        isActive: true,
      },
      {
        name: 'CNFans',
        affiliateId: 'findsindex_cnfans',
        commissionRate: 0.025,
        cookieDays: 45,
        isActive: true,
      },
      // ... 其他平台
    ],
  },
};
```

---

## 📊 申请进度追踪

### 申请流程

```
1. 准备资料
   - 网站 URL
   - 流量数据
   - 推广计划
   
2. 提交申请
   - 填写在线表格
   - 发送申请邮件
   
3. 等待审核
   - 通常 1-3 个工作日
   - 可能需要补充资料
   
4. 获得批准
   - 获取 affiliate_id
   - 下载推广素材
   
5. 测试链接
   - 创建测试链接
   - 验证追踪是否正常
   
6. 正式上线
   - 更新数据库
   - 监控数据
```

---

## ⚠️ 注意事项

### 申请技巧

1. **突出优势**
   - 强调目标用户匹配
   - 展示网站质量
   - 提供流量证明

2. **诚实预估**
   - 不要夸大流量
   - 说明增长计划
   - 设定合理预期

3. **多平台申请**
   - 同时申请多个平台
   - 分散风险
   - 对比佣金政策

4. **合规经营**
   - 遵守各平台规则
   - 不刷点击
   - 披露联盟关系

---

## 📈 预期收益

### 佣金率参考

| 平台 | 佣金率 | Cookie 期 | 最低提现 |
|------|--------|-----------|----------|
| Kakobuy | 2-5% | 30 天 | $50 |
| CNFans | 2-4% | 45 天 | $100 |
| ACBuy | 1.5-3% | 30 天 | $50 |
| Sugargoo | 2-4% | 30 天 | $50 |
| Superbuy | 3-6% | 60 天 | $100 |

### 收益预估

假设月点击 10,000 次，转化率 2%，平均订单¥500：

```
月订单：10,000 × 2% = 200 单
月销售额：200 × ¥500 = ¥100,000
月佣金（2.75%）：¥100,000 × 2.75% = ¥2,750
```

---

## 🔗 相关链接

### 联盟计划页面
- Kakobuy: https://www.kakobuy.com/affiliate
- CNFans: https://www.cnfans.com/affiliate
- ACBuy: https://www.acbuy.com/page/affiliate
- Sugargoo: https://www.sugargoo.com/affiliate
- Superbuy: https://www.superbuy.com/affiliate
- Pandabuy: https://www.pandabuy.com/affiliate
- Wegobuy: https://www.wegobuy.com/affiliate
- CSSBuy: https://www.cssbuy.com/affiliate

### 联盟网络（备选）
- ShareASale: https://www.shareasale.com
- CJ Affiliate: https://www.cj.com
- Impact: https://impact.com

---

**下一步**: 准备申请资料，开始批量申请！

**文档生成**: 阿瓜 🥒  
**生成时间**: 2026-04-16 00:05
