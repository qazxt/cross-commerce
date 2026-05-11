import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from '@/auth';

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">我的账户</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 用户信息 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>查看和编辑您的个人信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">邮箱</label>
              <p className="text-muted-foreground mt-1">
                {session.user.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">昵称</label>
              <p className="text-muted-foreground mt-1">
                {session.user.name || '未设置'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">用户 ID</label>
              <p className="text-muted-foreground mt-1">
                {(session.user as any).id || '未知'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 操作菜单 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              📦 我的订单
            </Button>
            <Button variant="outline" className="w-full justify-start">
              ❤️ 我的收藏
            </Button>
            <Button variant="outline" className="w-full justify-start">
              👁️ 浏览历史
            </Button>
            <Button variant="outline" className="w-full justify-start">
              ⚙️ 账户设置
            </Button>
            <form action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}>
              <Button
                variant="destructive"
                className="w-full justify-start"
                type="submit"
              >
                🚪 退出登录
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
