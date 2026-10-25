import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";
import { fileField, parseResourceForm, uploadResourceFile } from "@/lib/adminResources";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });

const noToken = () =>
  NextResponse.json(
    { success: false, error: "Thiếu SANITY_API_TOKEN (token có quyền ghi) trong .env.local" },
    { status: 500 }
  );

/** PUT /api/admin/resources/:id  (multipart/form-data, cùng fields với POST + removeFile) */
export async function PUT(request: NextRequest, { params }: Ctx) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) return noToken();

  const { id } = await params;
  try {
    const { errors, values, file, removeFile } = parseResourceForm(await request.formData());
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join("; ") }, { status: 400 });
    }

    let patch = writeClient.patch(id).set(values);
    if (file) {
      patch = patch.set({ file: fileField(await uploadResourceFile(file)) });
    } else if (removeFile) {
      patch = patch.unset(["file"]);
    }

    const updated = await patch.commit();
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error?.statusCode === 404) {
      return NextResponse.json(
        { success: false, error: `Resource '${id}' không tồn tại` },
        { status: 404 }
      );
    }
    console.error("[/api/admin/resources PUT]", error);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật bài viết", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/resources/:id
 * analyticsEvent đang tham chiếu cứng (strong reference) tới resource nên Sanity sẽ
 * từ chối xóa nếu còn event. Vì vậy phải xóa các event trước rồi mới xóa resource.
 */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) return noToken();

  const { id } = await params;
  try {
    await writeClient.delete({
      query: `*[_type == "analyticsEvent" && resourceId._ref in [$id, $draftId]]`,
      params: { id, draftId: `drafts.${id}` },
    });
    await writeClient.delete({
      query: `*[_type == "resource" && _id in [$id, $draftId]]`,
      params: { id, draftId: `drafts.${id}` },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[/api/admin/resources DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa bài viết", details: error?.message },
      { status: 500 }
    );
  }
}
