import type { Metadata } from 'next';
import { Geist, Geist_Mono, Jost } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import { profile } from '@/features/profile/data/profile';
import { DEFAULT_THEME } from '@/features/theme/constants';
import { themeScript } from '@/features/theme/themeScript';
import { siteUrl } from '@/lib/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Display face for headings (Futura-inspired, same era as the 1926 poster).
const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    // Home and any page without its own title.
    default: 'Lola Dolinsky | Frontend Engineer',
    // Child pages that set `title` (e.g. 'MRFACE') render as 'MRFACE | Lola Dolinsky'.
    template: '%s | Lola Dolinsky',
  },
  // Same text as the hero headline: one source of truth in profile data.
  description: profile.headline,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // data-scroll-behavior: Next 16 opt-in to keep route changes instant while
    // in-page anchor links scroll smoothly (see globals.css).
    // data-theme: the server always renders the default; themeScript may switch
    // it before paint, so suppressHydrationWarning tells React to keep the DOM's
    // value for <html>'s attributes instead of treating it as a mismatch.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jost.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
