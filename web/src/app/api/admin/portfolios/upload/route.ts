import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const unauthorized = () =>
  NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });

export async function POST(request: NextRequest) {
  if (!(await getSession())) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File exceeds 50MB limit' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'portfolios', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, cleanName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Compute file size display string
    const sizeInMB = file.size / (1024 * 1024);
    const fileSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(2)} MB` : `${(file.size / 1024).toFixed(1)} KB`;

    // Estimate page count by counting '/Type /Page' occurrences in buffer (simple & fast PDF page count)
    const textBuffer = buffer.toString('binary');
    const pageMatches = textBuffer.match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageMatches ? pageMatches.length : 15;

    return NextResponse.json({
      success: true,
      url: `/portfolios/uploads/${cleanName}`,
      fileSize,
      pageCount: Math.max(1, pageCount),
      originalFilename: file.name,
    });
  } catch (error: any) {
    console.error('[/api/admin/portfolios/upload POST]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload portfolio document', details: error?.message },
      { status: 500 }
    );
  }
}
