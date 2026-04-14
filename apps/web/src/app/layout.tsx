import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sturdy Waddle PM',
  description: 'AI-native project management for technical teams',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans">{children}</body>
    </html>
  );
}
