import { PortableText, defineQuery } from "next-sanity";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import Link from "next/link";

const POST_QUERY = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{ _id, title, body }`
);

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch(POST_QUERY, { slug }, options);

  if (!post) return notFound();

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          &larr; Back to posts
        </Link>
      </div>
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
          {post.title}
        </h1>
        {Array.isArray(post.body) && <PortableText value={post.body} />}
      </article>
    </main>
  );
}
