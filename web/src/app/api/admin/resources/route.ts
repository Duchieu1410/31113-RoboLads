import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";
import { ALL_RESOURCES_QUERY, type Resource } from "@/lib/queries";
import { fileField, parseResourceForm, uploadResourceFile } from "@/lib/adminResources";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });

/**
 * GET /api/admin/resources
 * Danh sách cho trang Admin. Đọc không qua CDN nên bài vừa đăng/sửa hiện ngay
 * (GET /api/resources của BE dùng CDN nên có thể trễ vài giây).
 */
export async function GET() {
  if (!(await getSession())) return unauthorized();
  try {
    const data = await writeClient.fetch<Resource[]>(ALL_RESOURCES_QUERY, {
      category: null,
      tag: null,
    } as any);
    return NextResponse.json({ success: true, count: data?.length ?? 0, data: data ?? [] });
  } catch (error: any) {
    console.error("[/api/admin/resources GET]", error);
    return NextResponse.json(
      { success: false, error: "Không tải được danh sách", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/resources   (multipart/form-data)
 * Fields: title*, category*, author, tags ("a, b, c"), description, file
 */
export async function POST(request: NextRequest) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Thiếu SANITY_API_TOKEN (token có quyền ghi) trong .env.local" },
      { status: 500 }
    );
  }

  try {
    const { errors, values, file } = parseResourceForm(await request.formData());
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join("; ") }, { status: 400 });
    }

    const assetId = file ? await uploadResourceFile(file) : null;

    const created = await writeClient.create({
      _type: "resource",
      ...values,
      publishedAt: new Date().toISOString(),
      ...(assetId ? { file: fileField(assetId) } : {}),
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("[/api/admin/resources POST]", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo bài viết", details: error?.message },
      { status: 500 }
    );
  }
}
