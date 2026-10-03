# RoboLads Resource API Documentation (for Minh)

This document provides a guide and code examples for using the Sanity resource data fetching functions in Next.js components.

---

## 📦 Imports

Import the fetch functions and TypeScript types from `@/lib/queries`:

```typescript
import {
  getAllResources,
  getResourceById,
  type Resource,
  type ResourceCategory,
} from "@/lib/queries";
```

*(You can also import from `lib/queries` directly).*

---

## 🔍 Available Functions

### 1. `getAllResources(category?, tag?, options?)`

Returns an array of `Resource[]` documents sorted by `publishedAt` descending.

#### Signatures & Overloads:
- **Fetch all resources:**
  ```typescript
  const resources = await getAllResources();
  ```
- **Filter by category:**
  ```typescript
  const cadResources = await getAllResources("CAD");
  ```
  *Allowed categories:* `"CAD" | "Programming" | "Mechanical" | "Failure Log"`
- **Filter by category and tag:**
  ```typescript
  const cadTutorials = await getAllResources("CAD", "tutorial");
  ```
- **Filter using an object:**
  ```typescript
  const programmingDocs = await getAllResources({
    category: "Programming",
    tag: "firmware",
  });
  ```
- **Optional Next.js caching/revalidation options:**
  ```typescript
  const resources = await getAllResources(undefined, undefined, {
    next: { revalidate: 60 }, // revalidate every 60 seconds
  });
  ```

---

### 2. `getResourceById(id, options?)`

Fetches a single full `Resource` document by its unique `_id`. Expands the file asset so you have direct access to the downloadable file URL, file name, and file size. Returns `null` if no document matches the given ID.

```typescript
const resource = await getResourceById("resource-id-123");
```

---

## 🧱 Component Usage Examples

### Example 1: Resource List Page (Server Component)

Create a page displaying all resources with optional category filtering (e.g. `src/app/resources/page.tsx`):

```tsx
import { getAllResources, type ResourceCategory } from "@/lib/queries";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const { category, tag } = await searchParams;
  const resources = await getAllResources(category, tag);

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">RoboLads Resources</h1>

      {/* Category Filter Pills */}
      <div className="flex gap-2 mb-8">
        {["CAD", "Programming", "Mechanical", "Failure Log"].map((cat) => (
          <Link
            key={cat}
            href={`/resources?category=${encodeURIComponent(cat)}`}
            className={`px-3 py-1 text-sm rounded-full border ${
              category === cat ? "bg-blue-600 text-white" : "bg-zinc-100 hover:bg-zinc-200"
            }`}
          >
            {cat}
          </Link>
        ))}
        {category && (
          <Link href="/resources" className="text-sm self-center text-zinc-500 hover:underline">
            Clear filter
          </Link>
        )}
      </div>

      {/* Resource Cards */}
      {resources.length === 0 ? (
        <p className="text-zinc-500">No resources found.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {resources.map((item) => (
            <li key={item._id} className="p-5 border rounded-lg shadow-sm hover:shadow-md transition">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {item.category}
              </span>
              <h2 className="text-xl font-bold mt-1 mb-2">
                <Link href={`/resources/${item._id}`} className="hover:underline">
                  {item.title}
                </Link>
              </h2>
              <p className="text-sm text-zinc-500 mb-4">
                By {item.author || "RoboLads Team"} •{" "}
                {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Draft"}
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((t) => (
                    <span key={t} className="text-xs bg-zinc-100 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

---

### Example 2: Single Resource Detail & File Download (Server Component)

Create a dynamic route (e.g. `src/app/resources/[id]/page.tsx`) to display full details, portable text content, and a CAD/PDF download button:

```tsx
import { getResourceById } from "@/lib/queries";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import Link from "next/link";

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
    <article className="max-w-3xl mx-auto py-12 px-6">
      <Link href="/resources" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to all resources
      </Link>

      <span className="text-xs uppercase tracking-wide font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
        {resource.category}
      </span>

      <h1 className="text-4xl font-extrabold text-zinc-900 mt-3 mb-2">
        {resource.title}
      </h1>

      <p className="text-sm text-zinc-500 mb-8">
        Published by {resource.author || "RoboLads Team"} on{" "}
        {resource.publishedAt ? new Date(resource.publishedAt).toLocaleDateString() : "Recent"}
      </p>

      {/* CAD / PDF File Download Section */}
      {fileAsset?.url && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-900">
              {fileAsset.originalFilename || "Download Attachment"}
            </p>
            {fileAsset.size && (
              <p className="text-xs text-zinc-500">
                {(fileAsset.size / (1024 * 1024)).toFixed(2)} MB • {fileAsset.extension?.toUpperCase()}
              </p>
            )}
          </div>
          <a
            href={`${fileAsset.url}?dl=${encodeURIComponent(fileAsset.originalFilename || "file")}`}
            download
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700 transition"
          >
            Download File
          </a>
        </div>
      )}

      {/* Rich Text / Portable Text Description */}
      {resource.description && (
        <div className="prose max-w-none text-zinc-800">
          <PortableText value={resource.description} />
        </div>
      )}

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">Tags:</span>
          {resource.tags.map((tag) => (
            <span key={tag} className="text-xs bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
```

---

### Example 3: Client Component with `useEffect` (if needed)

If you are rendering in a Client Component (`'use client'`):

```tsx
"use client";

import { useEffect, useState } from "react";
import { getAllResources, type Resource } from "@/lib/queries";

export function ClientResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllResources("CAD")
      .then((data) => setResources(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading resources...</div>;

  return (
    <ul>
      {resources.map((item) => (
        <li key={item._id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

---

## 📐 Data Structure Reference (`Resource`)

| Property | Type | Description |
| :--- | :--- | :--- |
| `_id` | `string` | Unique document ID in Sanity |
| `title` | `string` | Title of the resource |
| `category` | `"CAD" \| "Programming" \| "Mechanical" \| "Failure Log"` | Categorical tag |
| `tags` | `string[]` | Array of searchable keywords |
| `description` | `PortableTextBlock[]` | Rich text formatted with Portable Text |
| `file.asset.url` | `string` | Direct public download URL for CAD/PDF asset |
| `file.asset.originalFilename` | `string` | Uploaded filename (e.g. `chassis_v2.step`) |
| `file.asset.size` | `number` | File size in bytes |
| `file.asset.extension` | `string` | Extension without dot (e.g. `step`, `pdf`) |
| `author` | `string` | Name of author/contributor |
| `publishedAt` | `string` (ISO 8601) | Timestamp of publication |
