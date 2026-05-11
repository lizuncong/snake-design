import type { Metadata } from 'next';
import { DesignPageClient } from './DesignPageClient';

export const metadata: Metadata = {
  title: 'Design - Snake Design',
  description: 'AI-powered design tool',
};

type PageProps = {
  searchParams: Promise<{ projectId?: string }>;
};

export default async function DesignPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const projectId = params.projectId || '';

  return <DesignPageClient projectId={projectId} />;
}
