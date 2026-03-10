'use client';

import { useLoadKb } from '@/hooks/useKb';
import { useKbStore } from '@/stores/kbStore';
import { useSaveKb } from '@/hooks/useKb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconBook2, IconAlphabetLatin,
  IconShieldCheck, IconHelp, IconRobot, IconDeviceFloppy,
  IconLoader2, IconAlertCircle, IconBrandGithub, IconSitemap,
  IconLayoutDashboard, IconPuzzle, IconTags, IconLayoutColumns,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_GROUPS = [
  {
    label: 'Yapı',
    items: [
      { label: 'Harita', icon: IconSitemap, href: '/map' },
      { label: 'Sayfalar', icon: IconLayoutDashboard, href: '/pages' },
      { label: 'Layout Bileşenleri', icon: IconLayoutColumns, href: '/sections' },
      { label: 'Componentler', icon: IconPuzzle, href: '/components' },
    ],
  },
  {
    label: 'İçerik',
    items: [
      { label: 'FAQ', icon: IconHelp, href: '/faq' },
      { label: 'Kurallar', icon: IconShieldCheck, href: '/rules' },
      { label: 'Sözlük', icon: IconAlphabetLatin, href: '/glossary' },
      { label: 'Taglar', icon: IconTags, href: '/tags' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Agent', icon: IconRobot, href: '/agent' },
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
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <IconBook2 size={16} className="text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-bold tracking-tight text-sidebar-foreground text-sm leading-tight">Moodivation</p>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">KB Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
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
                      'flex items-center gap-2.5 py-1.5 rounded-lg text-sm transition-colors',
                      active
                        ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[6px]'
                        : 'text-sidebar-foreground hover:bg-muted/60 hover:text-foreground px-2.5'
                    )}
                  >
                    <Icon
                      size={15}
                      strokeWidth={active ? 2 : 1.75}
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
            <p className="text-[11px] text-amber-600">Kaydedilmemiş değişiklik</p>
          </div>
        )}
        <Button
          onClick={() => isDirty && save('KB updated')}
          disabled={!isDirty || isPending}
          variant={isDirty ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2 rounded-lg"
        >
          {isPending ? (
            <><IconLoader2 size={13} className="animate-spin" />Kaydediliyor...</>
          ) : isDirty ? (
            <><IconDeviceFloppy size={13} />GitHub&#39;a Kaydet</>
          ) : (
            <><IconBrandGithub size={13} className="text-muted-foreground" />Kaydedildi</>
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
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <KbLoader>{children}</KbLoader>
      </main>
    </div>
  );
}
