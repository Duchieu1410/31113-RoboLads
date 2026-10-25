"use client";

import { useEffect, useRef } from "react";

// Ghi 1 lượt "view" khi trang chi tiết được mở (theo README-API của BE).
// Mỗi tab trình duyệt chỉ tính 1 lần cho mỗi resource; muốn thử lại hãy mở tab ẩn danh
// hoặc xóa sessionStorage.
export function TrackResourceView({ resourceId }: { resourceId: string }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    const sessionKey = `tracked_view_${resourceId}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // sessionStorage bị chặn: vẫn tiếp tục ghi view
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId, type: "view" }),
      keepalive: true,
    }).catch((err) => console.warn("[Analytics] View tracking failed:", err));
  }, [resourceId]);

  return null;
}
