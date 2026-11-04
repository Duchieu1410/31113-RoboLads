import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_ROOTS = new Set(['Photo', 'models']);

// Never ship the raw 57.24 MB unoptimized CAD source to visitors; serve only the web derivative
const BLOCKED_FILES = new Set(['decodebot.glb']);

const MIME_MAP: Record<string, string> = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function hasUnsafeSegment(segment: string): boolean {
  if (!segment || segment.length > 255) return true;
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return true;
  }
  if (
    decoded === '.' ||
    decoded === '..' ||
    decoded.startsWith('.') ||
    decoded.includes('..') ||
    decoded.includes('/') ||
    decoded.includes('\\') ||
    decoded.includes('\0') ||
    segment.includes('/') ||
    segment.includes('\\') ||
    segment.includes('\0')
  ) {
    return true;
  }
  return false;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  // Check raw URL for encoded path-traversal sequences
  const rawPathname = req.nextUrl.pathname.toLowerCase();
  if (
    rawPathname.includes('%2e') ||
    rawPathname.includes('%2f') ||
    rawPathname.includes('%5c') ||
    rawPathname.includes('..')
  ) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const { slug } = await context.params;
  if (!Array.isArray(slug) || slug.length < 2) {
    return new NextResponse('Not Found', { status: 404 });
  }

  for (const seg of slug) {
    if (hasUnsafeSegment(seg)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const topDir = slug[0];
  // Strictly allow only Photo/ and models/ (exact capitalization) — never expose reference/
  if (!ALLOWED_ROOTS.has(topDir)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const fileName = slug[slug.length - 1].toLowerCase();
  if (BLOCKED_FILES.has(fileName)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const assetsRoot = path.resolve(process.cwd(), '..', 'assets');
  const allowedBase = path.resolve(assetsRoot, topDir);
  const resolvedPath = path.resolve(assetsRoot, ...slug);

  // Strict containment check via path.relative
  const rel = path.relative(allowedBase, resolvedPath);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_MAP[ext];
  if (!contentType) {
    return new NextResponse('Not Found', { status: 404 });
  }

  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(resolvedPath);
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (!stat.isFile()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(resolvedPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(fileBuffer.byteLength),
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
