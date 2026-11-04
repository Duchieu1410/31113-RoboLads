import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";
import { POST_BY_ID_QUERY, type Post } from "@/lib/queries";

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
 * GET /api/admin/posts/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return unauthorized();
  const { id } = await params;

  try {
    const post = await writeClient.fetch<Post>(POST_BY_ID_QUERY, { id });
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error("[/api/admin/posts/[id] GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/posts/[id]
 * Updates an existing post with title, slug, excerpt, author, category, and rich body blocks.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Server configuration error: SANITY_API_TOKEN write token missing" },
      { status: 500 }
    );
  }

  const { id } = await params;

  try {
    const json = await request.json();
    const { title, slug: customSlug, author, category, tags, excerpt, body } = json;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const finalSlug = (customSlug?.trim() ? slugify(customSlug) : slugify(title)) || `post-${Date.now()}`;
    const formattedBody = Array.isArray(body) ? body : [];

    const updated = await writeClient
      .patch(id)
      .set({
        title: title.trim(),
        slug: {
          _type: "slug",
          current: finalSlug,
        },
        author: author?.trim() || "RoboLads Team",
        category: category?.trim() || "Season Update",
        tags: Array.isArray(tags) ? tags : [],
        excerpt: excerpt?.trim() || "",
        body: formattedBody,
      })
      .commit();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[/api/admin/posts/[id] PUT]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update post", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return unauthorized();
  if (!process.env.SANITY_API_TOKEN) {
    return NextResponse.json(
      { success: false, error: "Server configuration error: SANITY_API_TOKEN missing" },
      { status: 500 }
    );
  }

  const { id } = await params;

  try {
    await writeClient.delete(id);
    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("[/api/admin/posts/[id] DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete post", details: error?.message },
      { status: 500 }
    );
  }
}
