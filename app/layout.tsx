import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
  adjustFontFallback: false,
  preload: false,
});

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
    <html lang="en" className={`dark ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500,400,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased font-sans overflow-x-hidden" suppressHydrationWarning>
        <main className="overflow-x-hidden w-full max-w-full">{children}</main>
      </body>
    </html>
  );
}
