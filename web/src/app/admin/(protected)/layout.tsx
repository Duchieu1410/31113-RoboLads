import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Bảo vệ thật ở server: chưa có cookie phiên hợp lệ thì chuyển về /admin/login
// trước khi trang được render (không còn dựa vào localStorage có thể bị giả mạo).
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return <>{children}</>;
}
