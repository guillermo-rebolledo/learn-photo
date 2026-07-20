import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";

const description = "Learn how camera settings shape light through calm, guided practice.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Learn Photo", template: "%s · Learn Photo" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Learn Photo",
    title: "Learn Photo",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Photo",
    description,
  },
};

const themeScript = `
  try {
    const saved = localStorage.getItem('learn-photo-theme');
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <SiteHeader />
        {children}
        <footer className="site-footer"><p>Learn Photo · Exposure Fundamentals, without the intimidation.</p></footer>
      </body>
    </html>
  );
}
