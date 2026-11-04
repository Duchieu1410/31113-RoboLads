import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getStoredPortfolios,
  createStoredPortfolio,
  type FtcPortfolio,
} from '@/lib/portfolioService';

export const dynamic = 'force-dynamic';

const unauthorized = () =>
  NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });

export async function GET() {
  if (!(await getSession())) return unauthorized();

  try {
    const list = await getStoredPortfolios();
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    console.error('[/api/admin/portfolios GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolios', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await getSession())) return unauthorized();

  try {
    const body = await request.json();
    const {
      teamNumber,
      teamName,
      schoolOrOrg,
      location,
      season,
      awards,
      summary,
      pdfUrl,
      fileSize,
      pageCount,
      notableMechanisms,
      tags,
    } = body;

    if (!teamNumber || !String(teamNumber).trim()) {
      return NextResponse.json({ success: false, error: 'Team number is required' }, { status: 400 });
    }
    if (!teamName || !String(teamName).trim()) {
      return NextResponse.json({ success: false, error: 'Team name is required' }, { status: 400 });
    }
    if (!season || !String(season).trim()) {
      return NextResponse.json({ success: false, error: 'Season is required' }, { status: 400 });
    }
    if (!pdfUrl || !String(pdfUrl).trim()) {
      return NextResponse.json({ success: false, error: 'Portfolio PDF document is required' }, { status: 400 });
    }

    const newPortfolio = await createStoredPortfolio({
      teamNumber: String(teamNumber).trim(),
      teamName: String(teamName).trim(),
      schoolOrOrg: String(schoolOrOrg || '').trim() || 'FIRST Tech Challenge',
      location: String(location || '').trim() || 'Worldwide',
      season: String(season).trim(),
      awards: Array.isArray(awards) ? awards : [],
      summary: {
        overview: String(summary?.overview || '').trim() || 'Official FTC Engineering Portfolio.',
        outreach: Array.isArray(summary?.outreach) ? summary.outreach : [],
        technical: Array.isArray(summary?.technical) ? summary.technical : [],
        software: Array.isArray(summary?.software) ? summary.software : [],
      },
      pdfUrl: String(pdfUrl).trim(),
      fileSize: String(fileSize || '1.0 MB'),
      pageCount: Number(pageCount) || 15,
      notableMechanisms: Array.isArray(notableMechanisms) ? notableMechanisms : [],
      tags: Array.isArray(tags) ? tags : [],
    });

    return NextResponse.json({ success: true, data: newPortfolio }, { status: 201 });
  } catch (error: any) {
    console.error('[/api/admin/portfolios POST]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio', details: error?.message },
      { status: 500 }
    );
  }
}
