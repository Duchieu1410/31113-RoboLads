import { NextRequest, NextResponse } from "next/server";
import { getAllResources } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/resources
 *
 * Public endpoint to fetch list of resources.
 * Supports optional query params:
 *   - category: e.g. "CAD", "Programming", "Mechanical", "Failure Log"
 *   - tag: e.g. "FIRST Tech Challenge"
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const resources = await getAllResources({ category, tag });

    return NextResponse.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error: any) {
    console.error("[/api/resources] Error fetching resources:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch resources",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
