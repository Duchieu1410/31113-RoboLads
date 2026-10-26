# RoboLads API Documentation & Integration Guide
**Final Locked Version for Team Distribution**  
*Target Audience: Minh (Frontend / Resource Catalog), Khang (Analytics Dashboard), & Engineering Team*

---

> [!IMPORTANT]
> **API DATA CONTRACT FROZEN**: This is the final specification. Request shapes, query parameters, header names, and response JSON schemas are locked and guaranteed stable across all endpoints. Do not modify these data contracts.

---

## 📑 Table of Contents

1. [Architecture Overview & Quick Reference](#1-architecture-overview--quick-reference)
2. [Environment Configuration & Secrets](#2-environment-configuration--secrets)
3. [How Minh Fetches Resources](#3-how-minh-fetches-resources)
   - [Approach A: Next.js Server Components (Recommended)](#approach-a-nextjs-server-components-recommended)
   - [Approach B: REST API Endpoints (`/api/resources`)](#approach-b-rest-api-endpoints-apiresources)
   - [Resource Data Schema & TypeScript Types](#resource-data-schema--typescript-types)
4. [How the Frontend Calls the Analytics Tracking Endpoint](#4-how-the-frontend-calls-the-analytics-tracking-endpoint)
   - [Specification: `POST /api/analytics/track`](#specification-post-apianalyticstrack)
   - [Trigger 1: Detail Page Mount = View Event](#trigger-1-detail-page-mount--view-event)
   - [Trigger 2: File Download Click = Download Event](#trigger-2-file-download-click--download-event)
   - [Full Integration Example (Detail Page)](#full-integration-example-detail-page)
5. [How Khang Calls the Summary Endpoint for the Dashboard](#5-how-khang-calls-the-summary-endpoint-for-the-dashboard)
   - [Specification: `GET /api/analytics/summary`](#specification-get-apianalyticssummary)
   - [Authentication & Headers](#authentication--headers)
   - [Response JSON Shape](#response-json-shape)
   - [Dashboard Implementation Examples (React / Next.js)](#dashboard-implementation-examples-react--nextjs)
6. [Testing Suite & Verification (`.http`, curl, CLI)](#6-testing-suite--verification-http-curl-cli)
   - [Running `api.http` in VS Code / JetBrains](#running-apihttp-in-vs-code--jetbrains)
   - [CLI & Script Testing (`test-api.sh` / `npm run test:api`)](#cli--script-testing-test-apish--npm-run-testapi)
   - [Quick cURL Commands](#quick-curl-commands)

---

## 1. Architecture Overview & Quick Reference

| Endpoint / Function | Method | Auth / Access | Primary Consumer | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `getAllResources(cat?, tag?)` | TS Call | Server-side / Public | Minh (Frontend) | Query resources in Server Components |
| `getResourceById(id)` | TS Call | Server-side / Public | Minh (Frontend) | Query single resource with expanded file asset |
| `/api/resources` | `GET` | Public | Minh / Mobile / Tests | REST list endpoint with optional `category` & `tag` filters |
| `/api/resources/:id` | `GET` | Public | Minh / Mobile / Tests | REST detail endpoint with expanded file asset |
| `/api/analytics/track` | `POST` | Public | Frontend (Minh/Team) | Log resource `view` or `download` event |
| `/api/analytics/summary` | `GET` | `x-analytics-secret` | Khang (Dashboard) | Aggregated view/download metrics and top 5 leaderboards |

---

## 2. Environment Configuration & Secrets

Create or verify `.env.local` inside `web/` (or `.env` in the root workspace):

```bash
# Public Sanity credentials (safe for client and server)
NEXT_PUBLIC_SANITY_PROJECT_ID="n5zz3lqj"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2026-09-18"

# Server-only write token (Required for POST /api/analytics/track mutations)
# Never expose this to client-side code or prefix with NEXT_PUBLIC_!
SANITY_API_TOKEN="sk..."

# Secret key required to access Khang's dashboard summary endpoint
ANALYTICS_SECRET_KEY="robolads-khang-2026"
```

---

## 3. How Minh Fetches Resources

Minh has two options to fetch resources depending on the component architecture:
1. **Approach A (Recommended for Next.js App Router)**: Direct queries in Server Components via `@/lib/queries` (zero client-bundle overhead, built-in Next.js data cache).
2. **Approach B (REST API)**: Via `GET /api/resources` and `GET /api/resources/:id` (for client-side SWR/React Query or mobile).

---

### Approach A: Next.js Server Components (Recommended)

#### 1. Import Functions & Types
```typescript
import {
  getAllResources,
  getResourceById,
  type Resource,
  type ResourceCategory,
} from "@/lib/queries";
```

#### 2. Resource List Page (`src/app/resources/page.tsx`)
```tsx
import { getAllResources, type ResourceCategory } from "@/lib/queries";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  // In Next.js 15+, searchParams is a Promise
  const { category, tag } = await searchParams;
  const resources = await getAllResources(category, tag, {
    next: { revalidate: 60 }, // ISR: Cache for 60 seconds
  });

  const categories = ["CAD", "Programming", "Mechanical", "Failure Log"];

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-extrabold text-zinc-900 mb-6">RoboLads Resources</h1>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/resources?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-1.5 text-sm font-medium rounded-full border transition ${
              category === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-200"
            }`}
          >
            {cat}
          </Link>
        ))}
        {category && (
          <Link href="/resources" className="text-sm self-center text-zinc-500 hover:underline ml-2">
            Clear filter
          </Link>
        )}
      </div>

      {/* Grid of Resource Cards */}
      {resources.length === 0 ? (
        <p className="text-zinc-500">No resources found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((item) => (
            <div key={item._id} className="p-6 border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                {item.category || "General"}
              </span>
              <h2 className="text-xl font-bold text-zinc-900 mt-3 mb-2">
                <Link href={`/resources/${item._id}`} className="hover:text-blue-600 hover:underline">
                  {item.title}
                </Link>
              </h2>
              <p className="text-xs text-zinc-500 mb-4">
                By {item.author || "RoboLads"} •{" "}
                {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Draft"}
              </p>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {item.tags.map((t) => (
                    <span key={t} className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
```

---

### Approach B: REST API Endpoints (`/api/resources`)

For client components, external consumers, or REST integrations:

#### 1. `GET /api/resources`
- **URL:** `/api/resources`
- **Query Params:**
  - `category` *(optional)*: `"CAD" | "Programming" | "Mechanical" | "Failure Log"`
  - `tag` *(optional)*: e.g. `"FIRST Tech Challenge"`
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "9b11369f-468e-40e4-9491-c09f76e36ccd",
      "_type": "resource",
      "_createdAt": "2026-10-02T17:10:01Z",
      "_updatedAt": "2026-10-02T17:10:48Z",
      "title": "RoboLads di worlds",
      "category": "Programming",
      "tags": ["FIRST Tech Challenge"],
      "description": [...],
      "file": {
        "asset": {
          "_id": "file-12345",
          "url": "https://cdn.sanity.io/files/n5zz3lqj/production/cad_model.step",
          "originalFilename": "cad_model.step",
          "extension": "step",
          "mimeType": "application/step",
          "size": 2451000
        }
      },
      "author": "Tran Huu Duc Hieu",
      "publishedAt": "2026-10-02T17:09:52.551Z"
    }
  ]
}
```

#### 2. `GET /api/resources/:id`
- **URL:** `/api/resources/9b11369f-468e-40e4-9491-c09f76e36ccd`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "9b11369f-468e-40e4-9491-c09f76e36ccd",
    "title": "RoboLads di worlds",
    "category": "Programming",
    "tags": ["FIRST Tech Challenge"],
    "description": [...],
    "file": {
      "asset": {
        "url": "https://cdn.sanity.io/files/...",
        "originalFilename": "guide.pdf",
        "size": 1048576,
        "extension": "pdf"
      }
    },
    "author": "Tran Huu Duc Hieu",
    "publishedAt": "2026-10-02T17:09:52.551Z"
  }
}
```
- **Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Resource with ID 'non-existent-id' not found"
}
```

---

### Resource Data Schema & TypeScript Types

Imported from `@/lib/queries`:

```typescript
export type ResourceCategory =
  | "CAD"
  | "Programming"
  | "Mechanical"
  | "Failure Log";

export interface ResourceFileAsset {
  _id?: string;
  url?: string;
  originalFilename?: string;
  extension?: string;
  mimeType?: string;
  size?: number; // Size in bytes
}

export interface ResourceFile {
  _type?: "file";
  asset?: ResourceFileAsset;
}

export interface Resource {
  _id: string;
  _type: "resource";
  _createdAt: string;
  _updatedAt: string;
  title: string;
  category?: ResourceCategory | string;
  tags?: string[];
  description?: PortableTextBlock[];
  file?: ResourceFile;
  author?: string;
  publishedAt?: string;
}
```

---

## 4. How the Frontend Calls the Analytics Tracking Endpoint

### Specification: `POST /api/analytics/track`

- **URL:** `/api/analytics/track`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body (Frozen Schema):**
```json
{
  "resourceId": "9b11369f-468e-40e4-9491-c09f76e36ccd",
  "type": "view" // Must be "view" or "download"
}
```

- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Analytics event 'view' tracked successfully",
  "data": {
    "id": "18c86d8b-1854-47c3-bb08-8e6fcb089b09",
    "type": "view",
    "resourceId": "9b11369f-468e-40e4-9491-c09f76e36ccd",
    "timestamp": "2026-10-05T09:45:00.000Z"
  }
}
```

- **Error Responses:**
  - `400 Bad Request`: `{ "error": "Missing or invalid 'resourceId'..." }`
  - `500 Server Error`: `{ "error": "Analytics tracking is temporarily unavailable (missing server write token)." }` (Occurs if `SANITY_API_TOKEN` is unset in server `.env.local`).

---

### Trigger 1: Detail Page Mount = View Event

To log a `view` on mount without double-counting in React Strict Mode / re-renders, use this drop-in Client Component:

#### File: `src/components/TrackResourceView.tsx`
```tsx
"use client";

import { useEffect, useRef } from "react";

interface Props {
  resourceId: string;
}

export function TrackResourceView({ resourceId }: Props) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Prevent double-tracking in React Strict Mode & fast re-renders
    if (trackedRef.current) return;
    trackedRef.current = true;

    // Optional session deduplication: only 1 view per resource per browser session
    const sessionKey = `tracked_view_${resourceId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    // Fire-and-forget POST tracking request
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId, type: "view" }),
      keepalive: true, // Guarantees completion even if user navigates away quickly
    }).catch((err) => {
      // Non-blocking: analytics failures do not disrupt the user
      console.warn("[Analytics] View tracking failed:", err);
    });
  }, [resourceId]);

  return null; // Headless component, renders no DOM
}
```

---

### Trigger 2: File Download Click = Download Event

When the user clicks the CAD or attachment download button, fire the `download` event and initiate the download:

#### File: `src/components/DownloadButton.tsx`
```tsx
"use client";

import { useState } from "react";

interface DownloadButtonProps {
  resourceId: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  extension?: string;
}

export function DownloadButton({
  resourceId,
  fileUrl,
  fileName = "download",
  fileSize,
  extension,
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      // 1. Fire analytics tracking event
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId, type: "download" }),
        keepalive: true,
      }).catch((err) => console.warn("[Analytics] Download tracking failed:", err));

      // 2. Trigger direct browser download
      const downloadUrl = `${fileUrl}?dl=${encodeURIComponent(fileName)}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 active:scale-95 transition disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {downloading ? "Preparing..." : "Download File"}
      {fileSize && (
        <span className="text-xs text-blue-200">
          ({(fileSize / (1024 * 1024)).toFixed(2)} MB)
        </span>
      )}
    </button>
  );
}
```

---

### Full Integration Example (Detail Page)

Here is how Minh combines the Server Component query with `<TrackResourceView>` and `<DownloadButton>`:

#### File: `src/app/resources/[id]/page.tsx`
```tsx
import { getResourceById } from "@/lib/queries";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import Link from "next/link";
import { TrackResourceView } from "@/components/TrackResourceView";
import { DownloadButton } from "@/components/DownloadButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResourceDetailPage({ params }: Props) {
  const { id } = await params;
  const resource = await getResourceById(id);

  if (!resource) {
    notFound();
  }

  const fileAsset = resource.file?.asset;

  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      {/* 1. Track view on mount (headless client component) */}
      <TrackResourceView resourceId={resource._id} />

      <Link href="/resources" className="text-sm font-medium text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to all resources
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
          {resource.category || "General"}
        </span>
        <span className="text-xs text-zinc-500">
          Published by {resource.author || "RoboLads"} on{" "}
          {resource.publishedAt ? new Date(resource.publishedAt).toLocaleDateString() : "Recent"}
        </span>
      </div>

      <h1 className="text-4xl font-extrabold text-zinc-900 mt-4 mb-6">
        {resource.title}
      </h1>

      {/* 2. File Download Section with tracking */}
      {fileAsset?.url && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-zinc-900">
              {fileAsset.originalFilename || "Resource Attachment"}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Type: {fileAsset.extension?.toUpperCase() || "File"} •{" "}
              {fileAsset.size ? `${(fileAsset.size / (1024 * 1024)).toFixed(2)} MB` : "Ready to download"}
            </p>
          </div>

          <DownloadButton
            resourceId={resource._id}
            fileUrl={fileAsset.url}
            fileName={fileAsset.originalFilename}
            fileSize={fileAsset.size}
            extension={fileAsset.extension}
          />
        </div>
      )}

      {/* Rich Text / Description */}
      {resource.description && (
        <div className="prose max-w-none text-zinc-800 border-t pt-8">
          <PortableText value={resource.description} />
        </div>
      )}
    </article>
  );
}
```

---

## 5. How Khang Calls the Summary Endpoint for the Dashboard

### Specification: `GET /api/analytics/summary`

- **URL:** `/api/analytics/summary`
- **Method:** `GET`
- **Access:** Internal / Protected
- **Supported Headers:**
  - `x-analytics-secret: <ANALYTICS_SECRET_KEY>` *(Preferred)*
  - `Authorization: Bearer <ANALYTICS_SECRET_KEY>`
- **Secret Key:** `robolads-khang-2026` (configured in `.env.local` via `ANALYTICS_SECRET_KEY`)

---

### Response JSON Shape (Frozen Contract)

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "totalViews": 142,
    "totalDownloads": 56,
    "topViewed": [
      {
        "resourceId": "9b11369f-468e-40e4-9491-c09f76e36ccd",
        "title": "RoboLads di worlds",
        "views": 84
      }
    ],
    "topDownloaded": [
      {
        "resourceId": "9b11369f-468e-40e4-9491-c09f76e36ccd",
        "title": "RoboLads di worlds",
        "downloads": 32
      }
    ],
    "byResource": [
      {
        "resourceId": "9b11369f-468e-40e4-9491-c09f76e36ccd",
        "title": "RoboLads di worlds",
        "views": 84,
        "downloads": 32
      }
    ]
  }
}
```

#### TypeScript Types for Khang:
```typescript
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
```

---

### Dashboard Implementation Examples (React / Next.js)

#### 1. In a Next.js Server Component Dashboard (`src/app/dashboard/page.tsx`)
If Khang's dashboard is built inside the Next.js app:

```tsx
import { getAnalyticsSummary } from "@/lib/queries";

export const dynamic = "force-dynamic"; // Always real-time

export default async function AdminDashboardPage() {
  // Option 1: Direct GROQ query bypassing HTTP layer
  const summary = await getAnalyticsSummary();

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-extrabold mb-8">RoboLads Analytics Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-semibold text-blue-700 uppercase">Total Views</p>
          <p className="text-4xl font-extrabold text-blue-900 mt-2">{summary.totalViews}</p>
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-semibold text-emerald-700 uppercase">Total Downloads</p>
          <p className="text-4xl font-extrabold text-emerald-900 mt-2">{summary.totalDownloads}</p>
        </div>
      </div>

      {/* Leaderboard Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Top 5 Most Viewed */}
        <section className="p-6 border border-zinc-200 rounded-xl">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">🔥 Top 5 Most Viewed</h2>
          <ul className="divide-y divide-zinc-100">
            {summary.topViewed.map((item, idx) => (
              <li key={item.resourceId} className="py-3 flex justify-between items-center">
                <span className="text-sm text-zinc-800">
                  <strong className="text-zinc-400 mr-2">#{idx + 1}</strong>
                  {item.title || "Untitled"}
                </span>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {item.views} views
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Top 5 Most Downloaded */}
        <section className="p-6 border border-zinc-200 rounded-xl">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">📥 Top 5 Most Downloaded</h2>
          <ul className="divide-y divide-zinc-100">
            {summary.topDownloaded.map((item, idx) => (
              <li key={item.resourceId} className="py-3 flex justify-between items-center">
                <span className="text-sm text-zinc-800">
                  <strong className="text-zinc-400 mr-2">#{idx + 1}</strong>
                  {item.title || "Untitled"}
                </span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {item.downloads} downloads
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
```

#### 2. Via REST API from External Dashboard or Client (`fetch`)
```typescript
async function fetchDashboardMetrics() {
  const res = await fetch("http://localhost:3000/api/analytics/summary", {
    method: "GET",
    headers: {
      "x-analytics-secret": "robolads-khang-2026",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Unauthorized or failed to fetch summary: ${res.status}`);
  }

  const { data } = await res.json();
  return data; // Typed as AnalyticsSummary
}
```

---

## 6. Testing Suite & Verification (`.http`, curl, CLI)

The codebase includes complete automated test files covering all 5 steps in the lifecycle:
1. `GET /api/resources` (Fetch resource list)
2. `GET /api/resources/:id` (Fetch resource detail)
3. `POST /api/analytics/track` (Track view event)
4. `POST /api/analytics/track` (Track download event)
5. `GET /api/analytics/summary` (Get summary with secret)

---

### Running `api.http` in VS Code / JetBrains

Open [`api.http`](file:///D:/Robotics/31113-robolads/api.http) (or [`test-api.http`](file:///D:/Robotics/31113-robolads/test-api.http)) in VS Code with the **REST Client** extension (`humao.rest-client`) or JetBrains IDEA.

Each request has a clickable `Send Request` button above it:

```http
@baseUrl = http://localhost:3000
@analyticsSecret = robolads-khang-2026
@resourceId = 9b11369f-468e-40e4-9491-c09f76e36ccd

### 1. Fetch Resource List
GET {{baseUrl}}/api/resources
Accept: application/json

### 2. Fetch Resource Detail
GET {{baseUrl}}/api/resources/{{resourceId}}
Accept: application/json

### 3. Track View
POST {{baseUrl}}/api/analytics/track
Content-Type: application/json

{
  "resourceId": "{{resourceId}}",
  "type": "view"
}

### 4. Track Download
POST {{baseUrl}}/api/analytics/track
Content-Type: application/json

{
  "resourceId": "{{resourceId}}",
  "type": "download"
}

### 5. Get Summary (Khang)
GET {{baseUrl}}/api/analytics/summary
x-analytics-secret: {{analyticsSecret}}
Accept: application/json
```

---

### CLI & Script Testing (`test-api.sh` / `npm run test:api`)

#### 1. Bash / Linux / macOS:
```bash
chmod +x ./test-api.sh
./test-api.sh http://localhost:3000 robolads-khang-2026
```

#### 2. Windows PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\test-api.ps1 -BaseUrl "http://localhost:3000"
```

#### 3. NPM Script (Cross-Platform Node.js):
```bash
cd web
npm run test:api
```

---

### Quick cURL Commands

```bash
# 1. Fetch Resource List
curl -s http://localhost:3000/api/resources

# 1b. Fetch Filtered Resources
curl -s "http://localhost:3000/api/resources?category=Programming"

# 2. Fetch Resource Detail
curl -s http://localhost:3000/api/resources/9b11369f-468e-40e4-9491-c09f76e36ccd

# 3. Track View Event
curl -s -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"resourceId":"9b11369f-468e-40e4-9491-c09f76e36ccd","type":"view"}'

# 4. Track Download Event
curl -s -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"resourceId":"9b11369f-468e-40e4-9491-c09f76e36ccd","type":"download"}'

# 5. Get Analytics Summary (Protected)
curl -s http://localhost:3000/api/analytics/summary \
  -H "x-analytics-secret: robolads-khang-2026"
```
