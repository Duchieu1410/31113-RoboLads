'use client';

import React from 'react';
import { PortfolioEditor } from '@/components/admin/PortfolioEditor';

export default function NewPortfolioPage() {
  return <PortfolioEditor isNew={true} />;
}
