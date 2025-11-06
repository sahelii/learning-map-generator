import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Learning Map Generator',
  description: 'Generate interactive learning paths powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

