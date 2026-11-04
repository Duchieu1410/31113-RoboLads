import { PortableText, defineQuery, type PortableTextComponents } from "next-sanity";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { ROUTES } from "@/routes";
import { BlockyHeader } from "@/components/BlockyHeader";
import { BlockyFooter } from "@/components/BlockyFooter";
import { ArrowLeft, Calendar, ShieldCheck, AlertCircle, Lightbulb, AlertTriangle, Info } from "lucide-react";
import { PixelPanel, PixelButton } from "@/components/pixel";

const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    author,
    category,
    tags,
    excerpt,
    body[] {
      ...,
      asset-> {
        _id,
        url,
        originalFilename
      }
    },
    _createdAt
  }
`);

export const revalidate = 30;

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-heading text-xl sm:text-2xl text-slate-900 mt-8 mb-4 pb-2 border-b-2 border-stone-300 tracking-wide">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-heading text-lg sm:text-xl text-slate-800 mt-6 mb-3 tracking-wide">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="font-body text-base text-slate-700 leading-relaxed mb-5">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-amber-600 pl-4 py-2 my-5 italic text-slate-800 bg-amber-100/30">
        {children}
      </blockquote>
    ),
  },
  types: {
    image: ({ value }) => {
      const src = value?.asset?.url || value?.url;
      if (!src) return null;
      return (
        <figure className="my-6">
          <div className="border-3 border-stone-300 bg-[#08081a] shadow-[4px_4px_0_#000000] overflow-hidden p-1">
            <img
              src={src}
              alt={value.alt || value.caption || "RoboLads article image"}
              className="w-full h-auto max-h-[520px] object-contain mx-auto"
            />
          </div>
          {(value.caption || value.alt) && (
            <figcaption className="text-center font-display text-[9px] text-slate-600 mt-2 tracking-wider">
              {value.caption || value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
    callout: ({ value }) => {
      const tone = value?.tone || "important";
      const config = {
        important: {
          border: "border-amber-600",
          bg: "bg-[#fef3c7]/90",
          badge: "bg-amber-400 text-black",
          titleColor: "text-amber-950",
          icon: <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />,
          defaultTitle: "IMPORTANT NOTICE",
        },
        tip: {
          border: "border-emerald-600",
          bg: "bg-[#ecfdf5]/90",
          badge: "bg-emerald-500 text-white",
          titleColor: "text-emerald-950",
          icon: <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0" />,
          defaultTitle: "ENGINEERING TIP",
        },
        warning: {
          border: "border-red-600",
          bg: "bg-[#fef2f2]/90",
          badge: "bg-red-500 text-white",
          titleColor: "text-red-950",
          icon: <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />,
          defaultTitle: "CRITICAL CAUTION",
        },
        info: {
          border: "border-cyan-600",
          bg: "bg-[#ecfeff]/90",
          badge: "bg-cyan-500 text-white",
          titleColor: "text-cyan-950",
          icon: <Info className="w-4 h-4 text-cyan-700 shrink-0" />,
          defaultTitle: "TECHNICAL SPECIFICATION",
        },
      }[tone as "important" | "tip" | "warning" | "info"] || {
        border: "border-amber-600",
        bg: "bg-[#fef3c7]/90",
        badge: "bg-amber-400 text-black",
        titleColor: "text-amber-950",
        icon: <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />,
        defaultTitle: "NOTE",
      };

      return (
        <div className={`my-6 border-2 ${config.border} ${config.bg} p-4 sm:p-5 shadow-[3px_3px_0_#000000]`}>
          <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-stone-400/40">
            {config.icon}
            <span className={`font-display text-[9px] uppercase tracking-wider px-2 py-0.5 ${config.badge} shadow-[1px_1px_0_#000]`}>
              {value?.title || config.defaultTitle}
            </span>
          </div>
          <p className="font-body text-sm text-slate-900 leading-relaxed whitespace-pre-line">
            {value?.text}
          </p>
        </div>
      );
    },
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch(POST_QUERY, { slug }, { next: { revalidate: 30 } }).catch(() => null);

  if (!post) return notFound();

  return (
    <div className="proto-root landing-root flex flex-col min-h-screen">
      <BlockyHeader />

      <main id="main-content" className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-10 block-page-enter">
        {/* Back Button */}
        <div className="mb-6">
          <PixelButton href={ROUTES.BLOG} variant="stone" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            BACK TO ALL DISPATCHES
          </PixelButton>
        </div>

        {/* Article Box: Parchment Reading Surface */}
        <PixelPanel variant="parchment" className="p-6 sm:p-10">
          <div className="pb-6 border-b-2 border-stone-300 mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 bg-amber-400 text-black font-display text-[9px] uppercase tracking-wider shadow-[2px_2px_0_#000000]">
                DISPATCH ENTRY
              </span>
              {post.category && (
                <span className="px-2 py-0.5 bg-amber-100 text-slate-800 font-display text-[8px] uppercase tracking-wider border border-stone-300">
                  {post.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading text-slate-900 tracking-tight leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-display text-slate-800 font-bold">
              {post._createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  {new Date(post._createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              {post.author && (
                <span className="text-slate-600 font-body text-xs">
                  By <strong className="font-semibold text-slate-900">{post.author}</strong>
                </span>
              )}
            </div>

            {post.excerpt && (
              <p className="mt-4 text-sm font-body text-slate-800 italic border-l-2 border-stone-300 pl-3 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {Array.isArray((post as any).tags) && ((post as any).tags as string[]).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {((post as any).tags as string[]).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-amber-100 text-slate-800 font-display text-[8px] uppercase tracking-wider border border-stone-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="prose max-w-none text-slate-800 leading-relaxed font-body text-base">
            {Array.isArray(post.body) && (
              <PortableText value={post.body} components={portableTextComponents} />
            )}
          </div>

          <div className="mt-12 pt-6 border-t-2 border-stone-300 flex items-center justify-between text-xs text-slate-600 font-body">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Published by {post.author || "RoboLads Communications Team"}
            </span>
            <span className="font-display text-[8px] text-slate-600">FTC #31113</span>
          </div>
        </PixelPanel>
      </main>

      <BlockyFooter />
    </div>
  );
}
