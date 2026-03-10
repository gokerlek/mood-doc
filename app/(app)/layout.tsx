'use client';

import { useLoadKb } from '@/hooks/useKb';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 flex flex-col overflow-y-auto">
          <KbLoader>{children}</KbLoader>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
