import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoredPortfolioById, getStoredPortfolios } from '@/lib/portfolioService';
import { PortfolioDetailClient } from './PortfolioDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const portfolio = await getStoredPortfolioById(resolvedParams.id);

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found | HSGS RoboLads #31113',
    };
  }

  const title = `FTC #${portfolio.teamNumber} ${portfolio.teamName} (${portfolio.season}) | Engineering Portfolio`;
  const description =
    portfolio.summary?.overview ||
    `Official FIRST Tech Challenge engineering portfolio for FTC #${portfolio.teamNumber} ${portfolio.teamName} - ${portfolio.season}.`;

  return {
    title,
    description,
    keywords: [
      `FTC ${portfolio.teamNumber}`,
      portfolio.teamName,
      portfolio.season,
      'FTC Engineering Portfolio',
      'FIRST Tech Challenge',
      'Robotics Documentation',
      ...portfolio.tags,
      ...portfolio.notableMechanisms,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const [portfolio, allPortfolios] = await Promise.all([
    getStoredPortfolioById(resolvedParams.id),
    getStoredPortfolios(),
  ]);

  if (!portfolio) {
    notFound();
  }

  return (
    <PortfolioDetailClient
      portfolio={portfolio}
      allPortfolios={allPortfolios}
    />
  );
}
