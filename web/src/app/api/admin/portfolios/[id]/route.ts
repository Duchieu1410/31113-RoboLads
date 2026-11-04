import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getStoredPortfolioById,
  updateStoredPortfolio,
  deleteStoredPortfolio,
} from '@/lib/portfolioService';

export const dynamic = 'force-dynamic';

const unauthorized = () =>
  NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return unauthorized();

  try {
    const { id } = await params;
    const portfolio = await getStoredPortfolioById(id);

    if (!portfolio) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error: any) {
    console.error('[/api/admin/portfolios/[id] GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateStoredPortfolio(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Portfolio not found to update' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[/api/admin/portfolios/[id] PUT]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update portfolio', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return unauthorized();

  try {
    const { id } = await params;
    const success = await deleteStoredPortfolio(id);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Portfolio not found to delete' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error: any) {
    console.error('[/api/admin/portfolios/[id] DELETE]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete portfolio', details: error?.message },
      { status: 500 }
    );
  }
}
