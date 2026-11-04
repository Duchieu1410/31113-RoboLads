import { NextRequest, NextResponse } from 'next/server';
import { getStoredPortfolioById } from '@/lib/portfolioService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const portfolio = await getStoredPortfolioById(id);

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error: any) {
    console.error('[/api/portfolios/[id] GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio', details: error?.message },
      { status: 500 }
    );
  }
}
