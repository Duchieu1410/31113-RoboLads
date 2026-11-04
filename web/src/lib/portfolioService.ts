import fs from 'fs';
import path from 'path';
import {
  type FtcPortfolio,
  FTC_PORTFOLIOS,
} from './portfolioTypes';

export type {
  PortfolioAward,
  PortfolioSummary,
  FtcPortfolio,
} from './portfolioTypes';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolios.json');

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(FTC_PORTFOLIOS, null, 2), 'utf-8');
  }
}

export async function getStoredPortfolios(): Promise<FtcPortfolio[]> {
  try {
    ensureDataFile();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return FTC_PORTFOLIOS;
  } catch (error) {
    console.error('[portfolioService] Error reading portfolios.json:', error);
    return FTC_PORTFOLIOS;
  }
}

export async function getStoredPortfolioById(id: string): Promise<FtcPortfolio | null> {
  const all = await getStoredPortfolios();
  const target = decodeURIComponent(id).trim().toLowerCase();
  return (
    all.find(
      (p) =>
        p.id.toLowerCase() === target ||
        p.teamNumber.toLowerCase() === target ||
        p.id.toLowerCase().replace(/[^a-z0-9]/g, '') === target.replace(/[^a-z0-9]/g, '')
    ) || null
  );
}

export async function saveStoredPortfolios(portfolios: FtcPortfolio[]): Promise<void> {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(portfolios, null, 2), 'utf-8');
}

export async function createStoredPortfolio(
  payload: Omit<FtcPortfolio, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<FtcPortfolio> {
  const all = await getStoredPortfolios();
  const now = new Date().toISOString();
  
  // Create clean ID
  const baseSlug = `${payload.teamNumber}-${payload.teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/^-|-$/g, '');
  let id = payload.id || baseSlug;
  let counter = 1;
  while (all.some((p) => p.id === id)) {
    id = `${baseSlug}-${counter++}`;
  }

  const newPortfolio: FtcPortfolio = {
    ...payload,
    id,
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newPortfolio);
  await saveStoredPortfolios(all);
  return newPortfolio;
}

export async function updateStoredPortfolio(
  id: string,
  payload: Partial<FtcPortfolio>
): Promise<FtcPortfolio | null> {
  const all = await getStoredPortfolios();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = all[index];
  const updated: FtcPortfolio = {
    ...existing,
    ...payload,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  await saveStoredPortfolios(all);
  return updated;
}

export async function deleteStoredPortfolio(id: string): Promise<boolean> {
  const all = await getStoredPortfolios();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length === all.length) return false;

  await saveStoredPortfolios(filtered);
  return true;
}
