import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

interface TrackRequestBody {
  resourceId?: unknown;
  type?: unknown;
}

/**
 * POST /api/analytics/track
 *
 * Public endpoint to track analytics events (views and downloads) for resources.
 * Body: { resourceId: string, type: "view" | "download" }
 */
export async function POST(request: NextRequest) {
  try {
    let body: TrackRequestBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { resourceId, type } = body;

    // Validate resourceId
    if (!resourceId || typeof resourceId !== "string" || !resourceId.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid 'resourceId'. Must be a non-empty string." },
        { status: 400 }
      );
    }

    // Validate event type
    if (type !== "view" && type !== "download") {
      return NextResponse.json(
        {
          error: "Invalid 'type'. Must be either 'view' or 'download'.",
        },
        { status: 400 }
      );
    }

    // Verify writeClient token is configured
    if (!process.env.SANITY_API_TOKEN) {
      console.error(
        "[/api/analytics/track] SANITY_API_TOKEN is not configured in the environment."
      );
      return NextResponse.json(
        {
          error:
            "Analytics tracking is temporarily unavailable (missing server write token).",
        },
        { status: 500 }
      );
    }

    const trimmedResourceId = resourceId.trim();

    // Create the analyticsEvent document in Sanity Content Lake
    const event = await writeClient.create({
      _type: "analyticsEvent",
      type,
      resourceId: {
        _type: "reference",
        _ref: trimmedResourceId,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Analytics event '${type}' tracked successfully`,
        data: {
          id: event._id,
          type: event.type,
          resourceId: trimmedResourceId,
          timestamp: event.timestamp,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/analytics/track] Error tracking event:", error);
    return NextResponse.json(
      {
        error: "Failed to record analytics event",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
