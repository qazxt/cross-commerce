import { prisma } from "@/lib/db";
import CreateBrandForm from "./CreateBrandForm";

export const metadata = {
  title: "添加品牌 - 后台管理",
};

export default async function CreateBrandPage() {
  return <CreateBrandForm />;
}
