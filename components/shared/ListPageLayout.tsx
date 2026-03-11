import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import type { PageHeaderProps } from '@/components/shared/PageHeader';

interface ListPageLayoutProps extends Omit<PageHeaderProps, 'className'> {
  maxWidth?: '4xl' | '5xl';
  children: ReactNode;
}

export function ListPageLayout({
  maxWidth = '4xl',
  children,
  ...headerProps
}: ListPageLayoutProps) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border">
        <PageHeader {...headerProps} className="pb-0 mb-0 border-b-0" />
      </div>
      <div
        className={cn(
          'px-6 py-6 w-full mx-auto space-y-5',
          maxWidth === '5xl' ? 'max-w-5xl' : 'max-w-4xl'
        )}
      >
        {children}
      </div>
    </div>
  );
}
