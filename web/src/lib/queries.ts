import { defineQuery } from "next-sanity";
import { sanityClient } from "./sanity";

// ============================================================================
// Types
// ============================================================================

export type ResourceCategory =
  | "CAD"
  | "Programming"
  | "Mechanical"
  | "Failure Log";

export interface ResourceFileAsset {
  _id?: string;
  _ref?: string;
  url?: string;
  originalFilename?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
}

export interface ResourceFile {
  _type?: "file";
  asset?: ResourceFileAsset;
}

export interface PortableTextBlock {
  _key?: string;
  _type?: string;
  children?: Array<{
    _key?: string;
    _type?: string;
    text?: string;
    marks?: string[];
  }>;
  style?: string;
  listItem?: string;
  markDefs?: Array<{
    _key?: string;
    _type?: string;
    href?: string;
    [key: string]: unknown;
  }>;
  level?: number;
  [key: string]: unknown;
}

export interface Resource {
  _id: string;
  _type: "resource";
  _createdAt: string;
  _updatedAt: string;
  _rev?: string;
  title: string;
  category?: ResourceCategory | string;
  tags?: string[];
  description?: PortableTextBlock[];
  file?: ResourceFile;
  author?: string;
  publishedAt?: string;
}

export interface ResourceFilterOptions {
  category?: ResourceCategory | string;
  tag?: string;
}

export type AnalyticsEventType = "view" | "download";

export interface AnalyticsEvent {
  _id: string;
  _type: "analyticsEvent";
  _createdAt?: string;
  _updatedAt?: string;
  type: AnalyticsEventType;
  resourceId: {
    _type: "reference";
    _ref: string;
  };
  timestamp: string;
}

export interface ResourceAnalyticsSummary {
  resourceId: string;
  title?: string;
  views: number;
  downloads: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalDownloads: number;
  topViewed: Array<{
    resourceId: string;
    title?: string;
    views: number;
  }>;
  topDownloaded: Array<{
    resourceId: string;
    title?: string;
    downloads: number;
  }>;
  byResource: ResourceAnalyticsSummary[];
}

// ============================================================================
// GROQ Queries
// ============================================================================

/**
 * GROQ query to retrieve all resources, optionally filtered by category and/or tag,
 * ordered by publishedAt descending.
 */
export const ALL_RESOURCES_QUERY = defineQuery(`
  *[_type == "resource" 
    && (!defined($category) || category == $category) 
    && (!defined($tag) || $tag in tags)
  ] | order(publishedAt desc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    category,
    tags,
    description,
    author,
    publishedAt,
    file {
      ...,
      asset-> {
        _id,
        url,
        originalFilename,
        extension,
        mimeType,
        size
      }
    }
  }
`);

/**
 * GROQ query to retrieve a single resource by its unique _id, with file asset expanded.
 */
export const RESOURCE_BY_ID_QUERY = defineQuery(`
  *[_type == "resource" && _id == $id][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    category,
    tags,
    description,
    author,
    publishedAt,
    file {
      ...,
      asset-> {
        _id,
        url,
        originalFilename,
        extension,
        mimeType,
        size
      }
    }
  }
`);

// ============================================================================
// Fetch Functions
// ============================================================================

export type SanityFetchOptions = {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

/**
 * Fetches resources from Sanity, sorted by publishedAt desc.
 * Supports filtering by category and/or tag.
 *
 * Usage examples:
 *  - getAllResources()
 *  - getAllResources("CAD")
 *  - getAllResources("CAD", "robotics")
 *  - getAllResources({ category: "Programming", tag: "firmware" })
 */
export async function getAllResources(
  categoryOrFilter?: string | ResourceFilterOptions,
  tagArg?: string,
  options?: SanityFetchOptions
): Promise<Resource[]> {
  let category: string | undefined = undefined;
  let tag: string | undefined = undefined;

  if (typeof categoryOrFilter === "object" && categoryOrFilter !== null) {
    category = categoryOrFilter.category ?? undefined;
    tag = categoryOrFilter.tag ?? undefined;
  } else if (typeof categoryOrFilter === "string") {
    category = categoryOrFilter;
    tag = tagArg ?? undefined;
  } else if (tagArg) {
    tag = tagArg;
  }

  const results = await sanityClient.fetch<Resource[]>(
    ALL_RESOURCES_QUERY,
    { category: category ?? null, tag: tag ?? null } as any,
    options
  );

  return results ?? [];
}

/**
 * Fetches a single full resource document by its _id.
 *
 * Usage example:
 *  - getResourceById("resource-id-123")
 */
export async function getResourceById(
  id: string,
  options?: SanityFetchOptions
): Promise<Resource | null> {
  if (!id) return null;

  const result = await sanityClient.fetch<Resource | null>(
    RESOURCE_BY_ID_QUERY,
    { id } as any,
    options
  );

  return result ?? null;
}

/**
 * GROQ query to calculate analytics summary:
 * - total views and downloads
 * - top 5 most-viewed resources with titles
 * - top 5 most-downloaded resources with titles
 * - all resources grouped by resourceId with titles and event counts
 */
export const ANALYTICS_SUMMARY_QUERY = defineQuery(`{
  "totalViews": count(*[_type == "analyticsEvent" && type == "view"]),
  "totalDownloads": count(*[_type == "analyticsEvent" && type == "download"]),
  "topViewed": *[_type == "resource"] {
    "resourceId": _id,
    title,
    "views": count(*[_type == "analyticsEvent" && resourceId._ref == ^._id && type == "view"])
  } | order(views desc)[0...5],
  "topDownloaded": *[_type == "resource"] {
    "resourceId": _id,
    title,
    "downloads": count(*[_type == "analyticsEvent" && resourceId._ref == ^._id && type == "download"])
  } | order(downloads desc)[0...5],
  "byResource": *[_type == "resource"] {
    "resourceId": _id,
    title,
    "views": count(*[_type == "analyticsEvent" && resourceId._ref == ^._id && type == "view"]),
    "downloads": count(*[_type == "analyticsEvent" && resourceId._ref == ^._id && type == "download"])
  }
}`);

/**
 * Fetches the analytics summary from Sanity Content Lake.
 * Bypasses CDN by default to provide real-time dashboard data.
 *
 * Usage example:
 *  - const summary = await getAnalyticsSummary();
 */
export async function getAnalyticsSummary(
  options?: SanityFetchOptions & { useCdn?: boolean }
): Promise<AnalyticsSummary> {
  const clientToUse = options?.useCdn
    ? sanityClient
    : sanityClient.withConfig({ useCdn: false });

  const summary = await clientToUse.fetch<AnalyticsSummary>(
    ANALYTICS_SUMMARY_QUERY,
    {},
    options
  );

  return (
    summary ?? {
      totalViews: 0,
      totalDownloads: 0,
      topViewed: [],
      topDownloaded: [],
      byResource: [],
    }
  );
}
