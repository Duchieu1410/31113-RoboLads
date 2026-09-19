import { client } from "@/sanity/client";
import { defineQuery } from "next-sanity";
import Link from "next/link";

const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(_createdAt desc){ _id, title, slug }`
);

const options = { next: { revalidate: 30 } };

export default async function PostsPage() {
  const posts = await client.fetch(POSTS_QUERY, {}, options);

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          RoboLads Blog
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Latest posts and updates powered by Sanity.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-zinc-500">No posts published yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.map((post) => (
            <li key={post._id} className="py-4">
              <Link
                href={`/${post.slug?.current}`}
                className="text-xl font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
