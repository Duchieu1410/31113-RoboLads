import { PortableText, defineQuery } from "next-sanity";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import Link from "next/link";
import { ROUTES } from "@/routes";

const POST_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{ _id, title, body, _createdAt }`
);

export const revalidate = 30;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch(POST_QUERY, { slug }, { next: { revalidate: 30 } }).catch(() => null);

  if (!post) return notFound();

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={ROUTES.BLOG}
          className="text-sm font-medium text-amber-500 hover:underline"
        >
          &larr; Back to all posts
        </Link>
        <Link
          href={ROUTES.HOME}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Home
        </Link>
      </div>
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          {post.title}
        </h1>
        {post._createdAt && (
          <p className="text-sm text-zinc-500 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            {new Date(post._createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
        {Array.isArray(post.body) && <PortableText value={post.body} />}
      </article>
    </main>
  );
}
