import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Moodivation KB Manager',
  description: 'Knowledge Base Yönetim Sistemi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={figtree.variable}>
      <body className="antialiased font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
