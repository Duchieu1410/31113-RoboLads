import type { Metadata } from 'next';
import { PortfoliosClient } from './PortfoliosClient';
import { getStoredPortfolios } from '@/lib/portfolioService';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FTC Engineering Portfolios & Award Archive | HSGS RoboLads #31113',
  description:
    'Curated FIRST Tech Challenge engineering portfolios, award highlights, and executive summaries with direct PDF downloads.',
  keywords: [
    'FTC Engineering Portfolio',
    'FIRST Tech Challenge',
    'RoboLads 31113',
    'FTC 7444',
    'Inspire Award',
    'Think Award',
    'FTC CAD',
    'FTC Outreach',
  ],
  openGraph: {
    title: 'FTC Engineering Portfolios & Award Archive | HSGS RoboLads #31113',
    description:
      'Curated FIRST Tech Challenge engineering portfolios, award highlights, and executive summaries with direct PDF downloads.',
    type: 'website',
  },
};

export default async function PortfoliosPage() {
  const portfolios = await getStoredPortfolios();
  return <PortfoliosClient initialPortfolios={portfolios} />;
}
