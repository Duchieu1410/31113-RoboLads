import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Unauthorized: Admin session required" }, { status: 401 });

/**
 * POST /api/admin/upload-file
 * Uploads any engineering file asset (CAD, STEP, STL, PDF, ZIP) to Sanity Assets
 * and returns the asset reference ID, public URL, filename, size, and extension.
 */
export async function POST(request: NextRequest) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Server configuration error: SANITY_API_TOKEN missing" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 100MB max for engineering assets
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File exceeds 100MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload("file", buffer, {
      filename: file.name,
      contentType: file.type || undefined,
    });

    return NextResponse.json({
      success: true,
      assetId: asset._id,
      url: asset.url,
      originalFilename: asset.originalFilename,
      size: asset.size,
      extension: asset.extension,
      mimeType: asset.mimeType,
    });
  } catch (error: any) {
    console.error("[/api/admin/upload-file POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file asset", details: error?.message },
      { status: 500 }
    );
  }
}
