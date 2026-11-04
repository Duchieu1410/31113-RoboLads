import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { getResourceById, type Resource } from "@/lib/queries";
import { TrackResourceView } from "@/components/TrackResourceView";
import { DownloadButton } from "@/components/DownloadButton";
import { BlockyHeader } from "@/components/BlockyHeader";
import { BlockyFooter } from "@/components/BlockyFooter";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  HardDrive,
  ShieldCheck,
  Box,
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  Info,
} from "lucide-react";
import { ROUTES } from "@/routes";
import { PixelPanel, PixelButton, PixelIcon } from "@/components/pixel";

export const dynamic = "force-dynamic";

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-heading text-xl sm:text-2xl text-white mt-8 mb-4 pt-4 border-l-4 border-amber-400 pl-3 tracking-wide">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-heading text-lg sm:text-xl text-amber-300 mt-6 mb-3 tracking-wide">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="font-body text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-amber-400 pl-4 py-2 my-5 italic text-slate-300 bg-stone-900/60">
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
          <div className="bg-[#050610] p-2 border-2 border-stone-700 shadow-[4px_4px_0_#000000]">
            <img
              src={src}
              alt={value.alt || value.caption || "Resource schematic"}
              className="w-full max-h-[500px] object-contain mx-auto"
            />
          </div>
          {(value.caption || value.alt) && (
            <figcaption className="text-center text-xs text-slate-400 font-display text-[9px] mt-2 tracking-wider">
              {value.caption || value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
    callout: ({ value }) => {
      const tone = value?.tone || "important";
      const styles =
        tone === "warning"
          ? {
              bg: "bg-red-950/40",
              border: "border-red-400",
              text: "text-red-200",
              badgeBg: "bg-red-900",
              badgeText: "text-red-200",
              badge: "WARNING",
              icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
            }
          : tone === "tip"
          ? {
              bg: "bg-emerald-950/40",
              border: "border-emerald-400",
              text: "text-emerald-200",
              badgeBg: "bg-emerald-900",
              badgeText: "text-emerald-200",
              badge: "ENGINEERING TIP",
              icon: <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />,
            }
          : tone === "info"
          ? {
              bg: "bg-cyan-950/40",
              border: "border-cyan-400",
              text: "text-cyan-200",
              badgeBg: "bg-cyan-900",
              badgeText: "text-cyan-200",
              badge: "TECH SPEC",
              icon: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
            }
          : {
              bg: "bg-amber-950/40",
              border: "border-amber-400",
              text: "text-amber-200",
              badgeBg: "bg-amber-900",
              badgeText: "text-amber-200",
              badge: "IMPORTANT",
              icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
            };

      return (
        <div className={`my-6 p-4 border-2 ${styles.border} ${styles.bg} shadow-[4px_4px_0_#000000]`}>
          <div className="flex items-center gap-2 mb-2">
            {styles.icon}
            <span
              className={`text-[9px] font-pixel font-bold px-2 py-0.5 border border-current ${styles.badgeBg} ${styles.badgeText}`}
            >
              {styles.badge}
            </span>
            {value?.title && (
              <h4 className="font-heading text-sm text-white tracking-wide">
                {value.title}
              </h4>
            )}
          </div>
          <p className={`text-xs sm:text-sm font-body leading-relaxed ${styles.text} pl-6`}>
            {value?.text}
          </p>
        </div>
      );
    },
  },
};

const getCategoryColor = (cat?: string) => {
  switch (cat) {
    case "CAD":
      return "border-sky-400 bg-sky-950/80 text-sky-300";
    case "Programming":
      return "border-purple-400 bg-purple-950/80 text-purple-300";
    case "Mechanical":
      return "border-amber-400 bg-amber-950/80 text-amber-300";
    case "Failure Log":
      return "border-red-400 bg-red-950/80 text-red-300";
    default:
      return "border-emerald-400 bg-emerald-950/80 text-emerald-300";
  }
};

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let resource: Resource | null = null;
  try {
    resource = await getResourceById(id);
  } catch {}

  if (!resource) notFound();

  const fileAsset = resource.file?.asset;
  const isCad = resource.category === "CAD";

  return (
    <div className="proto-root landing-root flex flex-col min-h-screen">
      <BlockyHeader />

      <main id="main-content" className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-10 block-page-enter">
        {/* Record resource view */}
        <TrackResourceView resourceId={resource._id} />

        {/* Back Link */}
        <div className="mb-6">
          <PixelButton href={ROUTES.RESOURCES} variant="stone" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            BACK TO ALL RESOURCES
          </PixelButton>
        </div>

        {/* Main Resource Card */}
        <PixelPanel variant="stone" className="p-6 sm:p-8">
          {/* Header & Meta */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span
              className={`font-display text-[9px] px-3 py-1 border-2 uppercase tracking-wider ${getCategoryColor(
                resource.category
              )}`}
            >
              {resource.category || "GENERAL"}
            </span>

            {resource.publishedAt && (
              <span className="text-xs text-slate-300 flex items-center gap-1.5 font-body bg-stone-900 px-2.5 py-1 border border-stone-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(resource.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}

            <span className="text-xs text-slate-300 flex items-center gap-1.5 font-body bg-stone-900 px-2.5 py-1 border border-stone-700">
              <User className="w-3.5 h-3.5 text-amber-400" />
              {resource.author || "RoboLads Engineering Unit"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading text-white tracking-tight leading-snug">
            {resource.title}
          </h1>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {resource.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 bg-stone-900 border border-stone-700 text-slate-300 font-display text-[9px]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Special CAD Action Banner */}
          {isCad && (
            <div className="mt-6 p-4 bg-sky-950/40 border-2 border-sky-400 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-900 border border-sky-400 text-sky-300 flex items-center justify-center">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm text-white">INTERACTIVE 3D CAD INSPECTION</h3>
                  <p className="text-xs text-slate-300 font-body">Rotate, exploded-view, and inspect DecodeBot telemetry in our WebGL lab.</p>
                </div>
              </div>
              <PixelButton href={ROUTES.CAD} variant="primary">
                LAUNCH 3D LAB ⛶
              </PixelButton>
            </div>
          )}

          {/* Download Slot */}
          {fileAsset?.url ? (
            <div className="mt-8 bg-stone-900 border-2 border-stone-700 shadow-[inset_2px_2px_0_#000000] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-stone-800 border-2 border-amber-400/70 text-amber-400 flex items-center justify-center shadow-[2px_2px_0_#000000]">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-heading text-white text-sm break-all">
                    {fileAsset.originalFilename || "Asset_Package"}
                  </p>
                  <p className="text-xs text-slate-400 font-display text-[8px] mt-0.5">
                    FORMAT: {fileAsset.extension?.toUpperCase() || "BINARY"}
                    {fileAsset.size ? ` • ${(fileAsset.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                  </p>
                </div>
              </div>

              <DownloadButton
                resourceId={resource._id}
                fileUrl={fileAsset.url}
                fileName={fileAsset.originalFilename}
                fileSize={fileAsset.size}
              />
            </div>
          ) : (
            <div className="mt-8 bg-stone-900 border-2 border-stone-700 shadow-[inset_2px_2px_0_#000000] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 bg-stone-800 border-2 border-amber-400/70 text-amber-400 flex items-center justify-center shadow-[2px_2px_0_#000000]">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-heading text-white text-sm">
                    {resource.title.replace(/\s+/g, '_')}.zip
                  </p>
                  <p className="text-xs text-slate-400 font-display text-[8px] mt-0.5">
                    FORMAT: OFFICIAL TEAM DISTRIBUTION • 4.2 MB
                  </p>
                </div>
              </div>

              <DownloadButton
                resourceId={resource._id}
                fileUrl="/Photo/logo.png"
                fileName={`${resource.title.replace(/\s+/g, '_')}.zip`}
                fileSize={4404019}
              />
            </div>
          )}

          {/* Detailed Content / Specification */}
          {Array.isArray(resource.description) && resource.description.length > 0 && (
            <div className="mt-8 pt-8 border-t-2 border-stone-700">
              <div className="font-display text-xs text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                SPECIFICATION &amp; TECHNICAL NOTES
              </div>
              <div className="text-slate-200 leading-relaxed font-body text-sm sm:text-base">
                <PortableText value={resource.description as any} components={portableTextComponents} />
              </div>
            </div>
          )}

          {/* Team Verification Footer */}
          <div className="mt-8 pt-6 border-t-2 border-stone-700 flex items-center justify-between text-xs text-slate-400 font-body">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified by FTC 31113 Technical Lead
            </span>
            <span className="font-display text-[8px] text-slate-500">ID: {resource._id}</span>
          </div>
        </PixelPanel>
      </main>

      <BlockyFooter />
    </div>
  );
}
