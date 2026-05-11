#!/usr/bin/env node
/**
 * 创建测试用户数据
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始创建测试用户...\n');

  // 测试用户列表
  const testUsers = [
    {
      name: '测试用户',
      email: 'test@example.com',
      password: 'password123',
    },
    {
      name: '阿瓜',
      email: 'agua@example.com',
      password: 'agua2026',
    },
  ];

  for (const userData of testUsers) {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⚠️  用户 ${userData.email} 已存在，跳过`);
      continue;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });

    console.log(`✅ 创建用户：${userData.name} (${userData.email})`);
    console.log(`   密码：${userData.password}`);
    console.log(`   ID: ${user.id}\n`);
  }

  console.log('✅ 测试用户创建完成！');
  console.log('\n📝 登录信息:');
  console.log('   用户 1: test@example.com / password123');
  console.log('   用户 2: agua@example.com / agua2026');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
