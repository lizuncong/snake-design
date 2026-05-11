'use client';

import { Link } from '@/libs/i18n/navigation';

export function Header() {
  return (
    <header className="flex h-12 items-center border-b border-[#2a2a4a] bg-[#0f1929] px-4">
      <Link
        href="/"
        className="cursor-pointer text-sm font-bold tracking-tight text-[#e0e0e0] hover:text-[#8bb4f9]"
      >
        Snake
        {' '}
        <span className="text-[#8bb4f9]">Design</span>
      </Link>
    </header>
  );
}
