"use client";

import { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";

interface DownloadButtonProps {
  resourceId: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
}

// Bấm tải: ghi 1 lượt "download" rồi mở link tải file từ Sanity CDN.
export function DownloadButton({ resourceId, fileUrl, fileName = "download", fileSize }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId, type: "download" }),
      keepalive: true,
    }).catch((err) => console.warn("[Analytics] Download tracking failed:", err));

    const link = document.createElement("a");
    link.href = `${fileUrl}?dl=${encodeURIComponent(fileName)}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
      }, 1600);
    }, 900);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className={`font-pixel text-[11px] px-6 py-3.5 border-2 shadow-[3px_3px_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000000] disabled:opacity-75 cursor-pointer uppercase tracking-wider inline-flex items-center gap-2 touch-manipulation transition-all ${
        downloaded
          ? "bg-emerald-400 text-black border-emerald-300 border-b-4 border-b-emerald-700 border-r-4 border-r-emerald-700"
          : "bg-amber-400 text-black border-amber-300 border-b-4 border-b-amber-600 border-r-4 border-r-amber-600 hover:bg-amber-300"
      }`}
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-black" />
          <span>FETCHING ASSET...</span>
        </>
      ) : downloaded ? (
        <>
          <Check className="w-4 h-4 text-black stroke-[3]" />
          <span>DOWNLOAD INITIATED!</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 text-black" />
          <span>DOWNLOAD ASSET</span>
          {fileSize ? (
            <span className="text-[9px] bg-black/15 px-1.5 py-0.5 rounded-none font-mono">
              {(fileSize / (1024 * 1024)).toFixed(2)} MB
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}
