import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";
import { RESOURCE_BY_ID_QUERY } from "@/lib/queries";
import { fileField, parseResourceForm, uploadResourceFile } from "@/lib/adminResources";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Unauthorized: Admin session required" }, { status: 401 });

const noToken = () =>
  NextResponse.json(
    { success: false, error: "Server configuration error: SANITY_API_TOKEN write token missing in .env.local" },
    { status: 500 }
  );

/**
 * GET /api/admin/resources/:id
 * Fetches a single resource document by ID with expanded file and image assets.
 */
export async function GET(_request: NextRequest, { params }: Ctx) {
  if (!(await getSession())) return unauthorized();

  const { id } = await params;
  try {
    const data = await writeClient.fetch(RESOURCE_BY_ID_QUERY, { id });
    if (!data) {
      return NextResponse.json(
        { success: false, error: `Resource '${id}' not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[/api/admin/resources/[id] GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch resource", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/resources/:id
 * Supports both JSON body (rich block builder) and multipart/form-data.
 */
export async function PUT(request: NextRequest, { params }: Ctx) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) return noToken();

  const { id } = await params;
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { title, category, author, tags, description, fileAssetId, removeFile, publishedAt } = body;

      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ success: false, error: "Resource title is required" }, { status: 400 });
      }

      let patch = writeClient.patch(id).set({
        title: title.trim(),
        category: category || "Mechanical",
        author: author?.trim() || "RoboLads Engineering Unit",
        tags: Array.isArray(tags) ? tags : [],
        publishedAt: publishedAt || new Date().toISOString(),
        description: Array.isArray(description) ? description : [],
      });

      if (fileAssetId) {
        patch = patch.set({ file: fileField(fileAssetId) });
      } else if (removeFile) {
        patch = patch.unset(["file"]);
      }

      const updated = await patch.commit();
      return NextResponse.json({ success: true, data: updated });
    }

    // Fallback: multipart/form-data
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
        { success: false, error: `Resource '${id}' not found` },
        { status: 404 }
      );
    }
    console.error("[/api/admin/resources PUT]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update resource", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/resources/:id
 * First removes associated analyticsEvents, then deletes the resource document.
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
      { success: false, error: "Failed to delete resource", details: error?.message },
      { status: 500 }
    );
  }
}
