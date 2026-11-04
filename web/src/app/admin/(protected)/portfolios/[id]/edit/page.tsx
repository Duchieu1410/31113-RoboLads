'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PortfolioEditor } from '@/components/admin/PortfolioEditor';
import { ROUTES } from '@/routes';
import { Loader2, AlertCircle } from 'lucide-react';
import type { FtcPortfolio } from '@/lib/portfolioTypes';

export default function EditPortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [portfolio, setPortfolio] = useState<FtcPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/portfolios/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push(ROUTES.ADMIN_LOGIN);
          return null;
        }
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load portfolio');
        }
        return data.data as FtcPortfolio;
      })
      .then((data) => {
        if (data) setPortfolio(data);
      })
      .catch((err) => {
        setError(err.message || 'Error loading portfolio');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050610] text-slate-100 flex items-center justify-center font-mono">
        <div className="flex items-center gap-3 text-amber-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading portfolio data...</span>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#050610] text-slate-100 flex flex-col items-center justify-center font-mono p-4">
        <div className="max-w-md w-full p-6 bg-red-950/80 border-2 border-red-500 text-center shadow-[4px_4px_0_#000000]">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h2 className="font-pixel text-xs text-white mb-2">PORTFOLIO NOT FOUND</h2>
          <p className="text-xs text-red-200 mb-4">{error || 'Unable to locate this portfolio record.'}</p>
          <button
            onClick={() => router.push(ROUTES.ADMIN)}
            className="px-4 py-2 bg-amber-400 text-black font-pixel text-xs font-bold"
          >
            RETURN TO ADMIN
          </button>
        </div>
      </div>
    );
  }

  return <PortfolioEditor initialPortfolio={portfolio} isNew={false} />;
}
