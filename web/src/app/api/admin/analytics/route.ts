import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * Chỉ admin đã đăng nhập mới gọi được. Đọc thẳng GROQ ở server nên
 * KHÔNG cần (và không để lộ) ANALYTICS_SECRET_KEY ở phía trình duyệt.
 * Shape trả về giữ nguyên contract của BE: { success, data: AnalyticsSummary }.
 */
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
  }
  try {
    const data = await getAnalyticsSummary();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[/api/admin/analytics]", error);
    return NextResponse.json(
      { success: false, error: "Không tải được analytics", details: error?.message },
      { status: 500 }
    );
  }
}
