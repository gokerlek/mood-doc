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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/docs" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="text-primary text-lg font-bold">Moodivation</span>
          <span className="text-muted-foreground text-sm">KB</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 ml-4">
          <Link
            href="/docs"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isDocsActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
            <span className="text-xs text-muted-foreground hidden sm:block">
              {new Date(lastUpdated).toLocaleDateString('tr-TR')}
            </span>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconBrandGithub size={18} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </header>
  );
}
