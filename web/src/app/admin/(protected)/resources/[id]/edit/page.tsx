'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResourceEditor } from '@/components/admin/ResourceEditor';
import { Loader2 } from 'lucide-react';
import type { Resource } from '@/lib/queries';

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/admin/resources/${encodeURIComponent(id)}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login');
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setResource(data.data);
        } else {
          setError(data.error || 'Failed to load resource');
        }
      })
      .catch((err) => {
        setError(err.message || 'Error loading resource');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08081a] text-slate-100 flex items-center justify-center font-mono text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-amber-400" />
        <span>Loading resource specification...</span>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#08081a] text-slate-100 flex flex-col items-center justify-center font-mono p-4">
        <div className="bg-red-950/80 border-2 border-red-500 p-6 max-w-md text-center shadow-[4px_4px_0_#000]">
          <p className="text-red-300 mb-4">⚠️ {error || 'Resource not found.'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-stone-900 border border-stone-700 text-xs text-amber-400 font-pixel cursor-pointer"
          >
            ← BACK TO ADMIN
          </button>
        </div>
      </div>
    );
  }

  return <ResourceEditor initialResource={resource} isNew={false} />;
}
