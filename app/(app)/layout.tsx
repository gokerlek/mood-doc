'use client';

import { useLoadKb } from '@/hooks/useKb';
import { useKbStore } from '@/stores/kbStore';
import { useSaveKb } from '@/hooks/useKb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconBook2, IconLayout2, IconListDetails, IconAlphabetLatin,
  IconShieldCheck, IconHelp, IconRobot, IconDeviceFloppy,
  IconLoader2, IconAlertCircle,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const NAV = [
  { id: 'platform', label: 'Platform', icon: IconBook2, href: '/' },
  { id: 'modules', label: 'Modules', icon: IconLayout2, href: '/modules' },
  { id: 'pages', label: 'Pages', icon: IconListDetails, href: '/pages' },
  { id: 'glossary', label: 'Glossary', icon: IconAlphabetLatin, href: '/glossary' },
  { id: 'rules', label: 'Rules', icon: IconShieldCheck, href: '/rules' },
  { id: 'faq', label: 'FAQ', icon: IconHelp, href: '/faq' },
  { id: 'agent', label: 'Agent', icon: IconRobot, href: '/agent' },
] as const;

function Sidebar() {
  const pathname = usePathname();
  const isDirty = useKbStore.useIsDirty();
  const { mutate: save, isPending } = useSaveKb();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="w-52 shrink-0 bg-white border-r flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b">
        <span className="font-bold text-[#2E6DA4] text-base">Moodivation</span>
        <p className="text-xs text-gray-400 mt-0.5">KB Manager</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
              isActive(href)
                ? 'bg-blue-50 text-[#2E6DA4] font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={() => isDirty && save('KB updated')}
          disabled={!isDirty || isPending}
          className={[
            'w-full flex items-center justify-center gap-2 text-sm font-medium py-2 px-3 rounded-lg transition-colors',
            isDirty
              ? 'bg-[#2E6DA4] hover:bg-[#255a8a] text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          {isPending
            ? <><IconLoader2 size={14} className="animate-spin" /> Saving...</>
            : <><IconDeviceFloppy size={14} /> {isDirty ? 'Save to GitHub' : 'Saved'}</>
          }
        </button>
        {isDirty && (
          <p className="text-[11px] text-amber-600 text-center mt-1.5">Unsaved changes</p>
        )}
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
          <IconLoader2 size={28} className="animate-spin text-[#2E6DA4] mx-auto" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2 max-w-sm">
          <IconAlertCircle size={28} className="text-red-500 mx-auto" />
          <p className="text-sm font-medium text-gray-800">GitHub connection failed</p>
          <p className="text-xs text-gray-500">Check GITHUB_PAT, GITHUB_OWNER, GITHUB_REPO in server env.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <KbLoader>{children}</KbLoader>
      </main>
    </div>
  );
}
