import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Enterprise CRM',
  description: 'Enterprise Customer Relationship Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
