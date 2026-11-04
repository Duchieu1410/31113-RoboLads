import { client } from "@/sanity/client";
import { defineQuery } from "next-sanity";
import Link from "next/link";
import { ROUTES } from "@/routes";
import { BlockyHeader } from "@/components/BlockyHeader";
import { BlockyFooter } from "@/components/BlockyFooter";
import { Calendar, ArrowRight } from "lucide-react";
import { PixelPanel, PixelButton, PixelIcon, AdvancementTrigger } from "@/components/pixel";

const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(_createdAt desc){ _id, title, slug, category, tags, excerpt, _createdAt }`
);

export const revalidate = 30;

export default async function BlogIndexPage() {
  const posts = await client.fetch(POSTS_QUERY, {}, { next: { revalidate: 30 } }).catch(() => []);

  return (
    <div className="proto-root landing-root flex flex-col min-h-screen">
      <BlockyHeader />
      <AdvancementTrigger id="library" />

      <main id="main-content" className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-10 block-page-enter">
        {/* Page Header */}
        <div className="mb-10 pb-6 border-b-2 border-stone-800">
          <div className="inline-block px-3 py-1 bg-amber-400 text-black font-display text-[9px] uppercase tracking-wider mb-3 shadow-[2px_2px_0_#000000]">
            TEAM DISPATCHES
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl text-white tracking-wide">
            ROBOLADS <span className="text-amber-400">BLOG &amp; UPDATES</span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl font-body leading-relaxed">
            Latest engineering milestones, match build logs, competition post-mortems, and community outreach chronicles from FTC Team #31113.
          </p>
        </div>

        {/* Posts List */}
        {!posts || posts.length === 0 ? (
          <PixelPanel variant="parchment" className="p-12 text-center my-8">
            <div className="flex justify-center mb-3">
              <PixelIcon name="book" size={32} />
            </div>
            <p className="font-heading text-base text-slate-900 mb-2">
              NO DISPATCHES PUBLISHED YET
            </p>
            <p className="text-xs text-slate-700 font-body">
              Our journalists and engineers are currently compiling competition notes. Check back soon!
            </p>
          </PixelPanel>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PixelPanel
                key={post._id}
                variant="parchment"
                className="p-6 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {post._createdAt && (
                      <span className="text-[10px] text-slate-700 font-bold flex items-center gap-1.5 font-display mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post._createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    <h2 className="text-xl font-heading text-slate-900 hover:text-amber-700 transition-colors">
                      <Link href={ROUTES.BLOG_POST(post.slug?.current)} className="block">
                        {post.title}
                      </Link>
                    </h2>

                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {post.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[8px] font-display uppercase tracking-wider px-1.5 py-0.5 bg-amber-100/80 text-slate-800 border border-stone-400 font-bold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <PixelButton
                    href={ROUTES.BLOG_POST(post.slug?.current)}
                    variant="stone"
                    className="flex-shrink-0 self-start sm:self-auto text-xs"
                  >
                    <span>READ ARTICLE</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </PixelButton>
                </div>
              </PixelPanel>
            ))}
          </div>
        )}
      </main>

      <BlockyFooter />
    </div>
  );
}
