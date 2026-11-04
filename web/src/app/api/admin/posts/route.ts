import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";
import { ALL_POSTS_QUERY, type Post } from "@/lib/queries";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Unauthorized: Admin session required" }, { status: 401 });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/admin/posts
 * Fetch all posts for the admin dashboard.
 */
export async function GET() {
  if (!(await getSession())) return unauthorized();

  try {
    const posts = await writeClient.fetch<Post[]>(ALL_POSTS_QUERY);
    return NextResponse.json({ success: true, count: posts?.length ?? 0, data: posts ?? [] });
  } catch (error: any) {
    console.error("[/api/admin/posts GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/posts
 * Create a new rich blog post with headers, paragraphs, inline images, and callout boxes.
 */
export async function POST(request: NextRequest) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Server configuration error: SANITY_API_TOKEN write token missing" },
      { status: 500 }
    );
  }

  try {
    const json = await request.json();
    const { title, slug: customSlug, author, category, tags, excerpt, body } = json;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const finalSlug = (customSlug?.trim() ? slugify(customSlug) : slugify(title)) || `post-${Date.now()}`;

    // Validate body is array of blocks
    const formattedBody = Array.isArray(body) ? body : [];

    const created = await writeClient.create({
      _type: "post",
      title: title.trim(),
      slug: {
        _type: "slug",
        current: finalSlug,
      },
      author: author?.trim() || "RoboLads Team",
      category: category?.trim() || "Season Update",
      tags: Array.isArray(tags) ? tags : [],
      excerpt: excerpt?.trim() || "",
      publishedAt: new Date().toISOString(),
      body: formattedBody,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("[/api/admin/posts POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create post", details: error?.message },
      { status: 500 }
    );
  }
}
