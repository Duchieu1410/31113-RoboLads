"use client";

import { useState } from "react";

interface DownloadButtonProps {
  resourceId: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
}

// Bấm tải: ghi 1 lượt "download" rồi mở link tải file từ Sanity CDN.
export function DownloadButton({ resourceId, fileUrl, fileName = "download", fileSize }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

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

    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {downloading ? "Đang tải..." : "Tải file"}
      {fileSize ? (
        <span className="text-xs text-blue-200">({(fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
      ) : null}
    </button>
  );
}
