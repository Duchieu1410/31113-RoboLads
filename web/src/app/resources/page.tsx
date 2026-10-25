import Link from "next/link";
import { getAllResources } from "@/lib/queries";

export const dynamic = "force-dynamic";

const CATEGORIES = ["CAD", "Programming", "Mechanical", "Failure Log"];

// Trang tạm để thử luồng analytics. Khi bản thiết kế của Minh xong thì thay file này.
export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const resources = await getAllResources(category, tag);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        RoboLads Resources
      </h1>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/resources?category=${encodeURIComponent(cat)}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              category === cat
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {cat}
          </Link>
        ))}
        {(category || tag) && (
          <Link href="/resources" className="ml-2 text-sm text-zinc-500 hover:underline">
            Bỏ lọc
          </Link>
        )}
      </div>

      {resources.length === 0 ? (
        <p className="text-zinc-500">Chưa có tài nguyên nào{category ? ` trong mục ${category}` : ""}.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {resources.map((item) => (
            <article
              key={item._id}
              className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
            >
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {item.category || "Khác"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                <Link href={`/resources/${item._id}`} className="hover:underline">
                  {item.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {item.author || "RoboLads"}
                {item.publishedAt ? `, ${new Date(item.publishedAt).toLocaleDateString("vi-VN")}` : ""}
              </p>
              {item.tags && item.tags.length > 0 && (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.tags.map((t) => `#${t}`).join("  ")}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
