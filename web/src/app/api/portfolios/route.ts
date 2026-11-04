import { NextRequest, NextResponse } from 'next/server';
import { getStoredPortfolios } from '@/lib/portfolioService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const portfolios = await getStoredPortfolios();
    return NextResponse.json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error: any) {
    console.error('[/api/portfolios GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolios', details: error?.message },
      { status: 500 }
    );
  }
}
