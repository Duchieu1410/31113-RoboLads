import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { getResourceById } from "@/lib/queries";
import { TrackResourceView } from "@/components/TrackResourceView";
import { DownloadButton } from "@/components/DownloadButton";

export const dynamic = "force-dynamic";

// Trang tạm để thử luồng analytics. Khi bản thiết kế của Minh xong thì thay file này.
export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = await getResourceById(id);
  if (!resource) notFound();

  const fileAsset = resource.file?.asset;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {/* Ghi 1 lượt xem khi trang mở */}
      <TrackResourceView resourceId={resource._id} />

      <Link href="/resources" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
        &larr; Tất cả tài nguyên
      </Link>

      <p className="mt-6 text-sm font-medium text-blue-600 dark:text-blue-400">
        {resource.category || "Khác"}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {resource.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {resource.author || "RoboLads"}
        {resource.publishedAt ? `, ${new Date(resource.publishedAt).toLocaleDateString("vi-VN")}` : ""}
      </p>

      {fileAsset?.url && (
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {fileAsset.originalFilename || "File đính kèm"}
            </p>
            <p className="text-sm text-zinc-500">
              {fileAsset.extension?.toUpperCase() || "File"}
              {fileAsset.size ? `, ${(fileAsset.size / (1024 * 1024)).toFixed(2)} MB` : ""}
            </p>
          </div>
          <DownloadButton
            resourceId={resource._id}
            fileUrl={fileAsset.url}
            fileName={fileAsset.originalFilename}
            fileSize={fileAsset.size}
          />
        </div>
      )}

      {Array.isArray(resource.description) && resource.description.length > 0 && (
        <div className="mt-8 space-y-4 border-t border-zinc-200 pt-8 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200">
          <PortableText value={resource.description as any} />
        </div>
      )}
    </main>
  );
}
