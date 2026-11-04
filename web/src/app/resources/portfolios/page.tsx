import type { Metadata } from 'next';
import { PortfoliosClient } from '@/app/portfolios/PortfoliosClient';
import { getStoredPortfolios } from '@/lib/portfolioService';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FTC Engineering Portfolios | Resources | HSGS RoboLads #31113',
  description:
    'Curated FIRST Tech Challenge engineering portfolios, award highlights, and executive summaries under RoboLads Resources.',
};

export default async function ResourcesPortfoliosPage() {
  const portfolios = await getStoredPortfolios();
  return <PortfoliosClient initialPortfolios={portfolios} isUnderResources={true} />;
}
