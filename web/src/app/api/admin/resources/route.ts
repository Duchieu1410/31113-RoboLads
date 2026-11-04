import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";
import { ALL_RESOURCES_QUERY, type Resource } from "@/lib/queries";
import { fileField, parseResourceForm, uploadResourceFile } from "@/lib/adminResources";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Unauthorized: Admin session required" }, { status: 401 });

/**
 * GET /api/admin/resources
 * Fetches all engineering resources from Sanity Content Lake.
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
      { success: false, error: "Failed to fetch resource list", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/resources
 * Supports both JSON body (rich block builder) and multipart/form-data.
 */
export async function POST(request: NextRequest) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Server configuration error: SANITY_API_TOKEN write token missing in .env.local" },
      { status: 500 }
    );
  }

  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { title, category, author, tags, description, fileAssetId, publishedAt } = body;

      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ success: false, error: "Resource title is required" }, { status: 400 });
      }

      const doc: { _type: "resource"; [key: string]: any } = {
        _type: "resource",
        title: title.trim(),
        category: category || "Mechanical",
        author: author?.trim() || "RoboLads Engineering Unit",
        tags: Array.isArray(tags) ? tags : [],
        publishedAt: publishedAt || new Date().toISOString(),
        description: Array.isArray(description) ? description : [],
      };

      if (fileAssetId) {
        doc.file = fileField(fileAssetId);
      }

      const created = await writeClient.create(doc);
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    // Fallback: multipart/form-data
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
      { success: false, error: "Failed to create resource", details: error?.message },
      { status: 500 }
    );
  }
}
