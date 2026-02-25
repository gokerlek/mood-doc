'use client';

import { useLoadKb } from '@/hooks/useKb';
import { useKbStore } from '@/stores/kbStore';
import { useSaveKb } from '@/hooks/useKb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconBook2, IconLayout2, IconListDetails, IconAlphabetLatin,
  IconShieldCheck, IconHelp, IconRobot, IconDeviceFloppy,
  IconLoader2, IconAlertCircle, IconSitemap, IconBrandGithub,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_GROUPS = [
  {
    label: 'Content',
    items: [
      { label: 'Platform', icon: IconBook2, href: '/' },
      { label: 'Modules', icon: IconLayout2, href: '/modules' },
      { label: 'Pages', icon: IconListDetails, href: '/pages' },
      { label: 'Glossary', icon: IconAlphabetLatin, href: '/glossary' },
      { label: 'Rules', icon: IconShieldCheck, href: '/rules' },
      { label: 'FAQ', icon: IconHelp, href: '/faq' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Agent', icon: IconRobot, href: '/agent' },
      { label: 'Map', icon: IconSitemap, href: '/map' },
    ],
  },
] as const;

function Sidebar() {
  const pathname = usePathname();
  const isDirty = useKbStore.useIsDirty();
  const { mutate: save, isPending } = useSaveKb();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">

      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <IconBook2 size={14} className="text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sidebar-foreground text-sm leading-tight">Moodivation</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">KB Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, icon: Icon, href }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.75}
                      className={active ? 'text-primary' : 'text-muted-foreground'}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Save */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {isDirty && (
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            <p className="text-[11px] text-amber-600">Unsaved changes</p>
          </div>
        )}
        <Button
          onClick={() => isDirty && save('KB updated')}
          disabled={!isDirty || isPending}
          variant={isDirty ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2"
        >
          {isPending ? (
            <><IconLoader2 size={13} className="animate-spin" />Saving...</>
          ) : isDirty ? (
            <><IconDeviceFloppy size={13} />Save to GitHub</>
          ) : (
            <><IconBrandGithub size={13} className="text-muted-foreground" />All saved</>
          )}
        </Button>
      </div>
    </aside>
  );
}

function KbLoader({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useLoadKb();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <IconLoader2 size={28} className="animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2 max-w-sm">
          <IconAlertCircle size={28} className="text-destructive mx-auto" />
          <p className="text-sm font-medium text-foreground">GitHub connection failed</p>
          <p className="text-xs text-muted-foreground">Check GITHUB_PAT, GITHUB_OWNER, GITHUB_REPO in server env.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <KbLoader>{children}</KbLoader>
      </main>
    </div>
  );
}
