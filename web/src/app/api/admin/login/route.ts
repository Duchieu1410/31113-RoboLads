import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, checkCredentials, createSessionToken, sessionCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/admin/login  — body: { username, password } */
export async function POST(request: NextRequest) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    console.error("[/api/admin/login] Thiếu ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SESSION_SECRET trong .env.local");
    return NextResponse.json(
      { success: false, error: "Server chưa cấu hình tài khoản admin." },
      { status: 500 }
    );
  }

  if (!checkCredentials(username, password)) {
    await new Promise((r) => setTimeout(r, 500)); // làm chậm dò mật khẩu
    return NextResponse.json(
      { success: false, error: "Tài khoản hoặc mật khẩu không chính xác!" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(username), sessionCookieOptions);
  return response;
}
