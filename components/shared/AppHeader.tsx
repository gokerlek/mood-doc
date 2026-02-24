'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBrandGithub, IconBook2, IconPencil } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  version?: string;
  lastUpdated?: string;
  showEditor?: boolean;
}

export function AppHeader({ version, lastUpdated, showEditor = true }: AppHeaderProps) {
  const pathname = usePathname();
  const isDocsActive = pathname.startsWith('/docs');
  const isEditorActive = pathname.startsWith('/editor');

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/docs" className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="text-[#2E6DA4] text-lg font-bold">Moodivation</span>
          <span className="text-gray-400 text-sm">KB</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 ml-4">
          <Link
            href="/docs"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isDocsActive
                ? 'bg-blue-50 text-[#2E6DA4]'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            <IconBook2 size={15} strokeWidth={1.5} />
            Docs
          </Link>
          {showEditor && (
            <Link
              href="/editor"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isEditorActive
                  ? 'bg-blue-50 text-[#2E6DA4]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <IconPencil size={15} strokeWidth={1.5} />
              Editor
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {version && (
            <Badge variant="secondary" className="text-xs">
              v{version}
            </Badge>
          )}
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden sm:block">
              {new Date(lastUpdated).toLocaleDateString('tr-TR')}
            </span>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-700"
          >
            <IconBrandGithub size={18} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </header>
  );
}
