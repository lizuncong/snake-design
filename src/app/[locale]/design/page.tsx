import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DesignLayout } from './components/DesignLayout';

export const metadata: Metadata = {
  title: 'Design - Snake Design',
  description: 'AI-powered design tool',
};

export default function DesignPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#1a1a2e]"><div className="text-sm text-[#888]">加载中...</div></div>}>
      <DesignLayout />
    </Suspense>
  );
}
