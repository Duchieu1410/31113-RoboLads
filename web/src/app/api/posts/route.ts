import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

/**
 * GET /api/posts
 *
 * Public endpoint to fetch the list of published blog posts / team dispatches.
 * Supports optional query params:
 *   - limit: number of posts to return (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const limit = Math.max(1, Math.min(50, Number(request.nextUrl.searchParams.get("limit") || 10)));
    const posts = await sanityClient.fetch(
      `*[_type == "post" && defined(slug.current)] | order(_createdAt desc)[0...$limit] {
        _id,
        title,
        slug,
        category,
        excerpt,
        _createdAt
      }`,
      { limit }
    );

    return NextResponse.json({
      success: true,
      count: posts?.length || 0,
      data: posts || [],
    });
  } catch (error: any) {
    console.error("[/api/posts] Error fetching posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
