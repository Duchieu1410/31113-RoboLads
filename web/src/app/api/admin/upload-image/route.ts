import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Unauthorized: Admin session required" }, { status: 401 });

/**
 * POST /api/admin/upload-image
 * Uploads an image file to Sanity Assets and returns the asset reference ID and public URL.
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
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File must be a valid image" }, { status: 400 });
    }

    // 15MB max for blog images
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Image exceeds 15MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type || undefined,
    });

    return NextResponse.json({
      success: true,
      assetId: asset._id,
      url: asset.url,
      originalFilename: asset.originalFilename,
    });
  } catch (error: any) {
    console.error("[/api/admin/upload-image POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image", details: error?.message },
      { status: 500 }
    );
  }
}
