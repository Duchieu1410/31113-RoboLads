import { client } from "@/sanity/client";
import { defineQuery } from "next-sanity";
import Link from "next/link";
import { ROUTES } from "@/routes";

const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(_createdAt desc){ _id, title, slug, _createdAt }`
);

export const revalidate = 30;

export default async function BlogIndexPage() {
  const posts = await client.fetch(POSTS_QUERY, {}, { next: { revalidate: 30 } }).catch(() => []);

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href={ROUTES.HOME}
            className="text-sm font-medium text-amber-500 hover:underline mb-2 inline-block font-mono"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            RoboLads Blog & Updates
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Latest news, build logs, and updates from the FTC 31113 RoboLads team.
          </p>
        </div>
        <Link
          href={ROUTES.RESOURCES}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          View Resources &rarr;
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            No blog posts published yet. Visit the CMS Studio at port 3333 to publish the first post!
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.map((post: any) => (
            <li key={post._id} className="py-5">
              <Link
                href={ROUTES.BLOG_POST(post.slug?.current)}
                className="text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {post.title}
              </Link>
              {post._createdAt && (
                <p className="text-sm text-zinc-500 mt-1">
                  Published on {new Date(post._createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
