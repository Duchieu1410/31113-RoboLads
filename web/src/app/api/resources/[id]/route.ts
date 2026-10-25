import { NextRequest, NextResponse } from "next/server";
import { getResourceById } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/resources/[id]
 *
 * Public endpoint to fetch full detail of a single resource by its unique _id.
 * Includes expanded file asset URL, name, size, extension, etc.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid resource ID" },
        { status: 400 }
      );
    }

    const resource = await getResourceById(id.trim());

    if (!resource) {
      return NextResponse.json(
        { success: false, error: `Resource with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resource,
    });
  } catch (error: any) {
    console.error("[/api/resources/[id]] Error fetching resource detail:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch resource detail",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
