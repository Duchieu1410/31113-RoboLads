import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { ANALYTICS_SUMMARY_QUERY, type AnalyticsSummary } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Secret key verification for internal dashboard access (used by Khang).
 * Checks x-analytics-secret, x-secret-key, x-api-key, or Authorization Bearer header.
 */
function verifySecretKey(request: NextRequest): boolean {
  const configuredSecret =
    process.env.ANALYTICS_SECRET_KEY ||
    process.env.INTERNAL_DASHBOARD_SECRET ||
    "robolads-khang-2026";

  const headerKey =
    request.headers.get("x-analytics-secret") ||
    request.headers.get("x-secret-key") ||
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!headerKey) {
    return false;
  }

  return headerKey === configuredSecret;
}

/**
 * GET /api/analytics/summary
 *
 * Protected internal route for Khang's dashboard.
 * Requires secret key in header (e.g. `x-analytics-secret: <secret>` or `Authorization: Bearer <secret>`).
 *
 * Uses GROQ to count total views and downloads, grouped by resourceId,
 * joined with resource titles, returning the top 5 most-viewed and top 5 most-downloaded resources.
 */
export async function GET(request: NextRequest) {
  if (!verifySecretKey(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "Missing or invalid secret key. Provide 'x-analytics-secret' or 'Authorization: Bearer <secret>' in request headers.",
      },
      { status: 401 }
    );
  }

  try {
    // Execute GROQ query bypassing CDN cache for real-time dashboard analytics
    const summary = await sanityClient
      .withConfig({ useCdn: false })
      .fetch<AnalyticsSummary>(ANALYTICS_SUMMARY_QUERY);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("[/api/analytics/summary] Error fetching summary:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics summary",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
