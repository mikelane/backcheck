import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Backcheck — See who really owns your Portland rental',
  description:
    'Portland renters get background-checked, credit-checked, eviction-screened. The landlord behind the LLC? We have no idea. Backcheck walks the ownership chain and surfaces who actually owns the building.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
