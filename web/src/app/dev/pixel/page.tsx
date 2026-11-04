import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PixelShowcase } from './PixelShowcase';

export const metadata: Metadata = {
  title: 'Pixel primitives (dev)',
  robots: { index: false, follow: false },
};

/** Hidden dev page: every pixel primitive in every state. Not linked anywhere; 404 in production. */
export default function PixelDevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <PixelShowcase />;
}
