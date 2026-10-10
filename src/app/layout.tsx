import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Lola Dolinsky's Portfolio",
  description:
    "Showcasing Lola Dolinsky's work and projects in a high-performance Next.js application with 3D visuals.",
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // data-scroll-behavior: Next 16 opt-in to keep route changes instant while
    // in-page anchor links scroll smoothly (see globals.css).
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
