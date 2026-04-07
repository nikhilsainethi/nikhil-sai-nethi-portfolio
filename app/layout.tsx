import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteDescription, siteTitle, siteUrl } from "@/lib/site";
import { ThemeToggle } from "@/components/portfolio/ThemeToggle";
import { CursorSpotlight } from "@/components/portfolio/CursorSpotlight";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { Header } from "@/components/portfolio/Header";
import { HeroAnimation } from "@/components/portfolio/HeroAnimation";
import { PageIntro } from "@/components/portfolio/PageIntro";
import { ScrollProgress } from "@/components/portfolio/ScrollProgress";
import { SiteFooter } from "@/components/portfolio/SiteFooter";
import { defaultThemeMode, getThemeInitializationScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: siteTitle,
    locale: "en_US",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-theme={defaultThemeMode}
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{ __html: getThemeInitializationScript() }}
        />
        <PageIntro />
        <ScrollProgress />
        <CustomCursor />
        <CursorSpotlight />
        <div className="grain-overlay relative min-h-screen [overflow:clip]">
          <HeroAnimation />
          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[90rem] flex-col">
            <div className="px-4 sm:px-6 lg:px-8">
              <Header />
            </div>
            <div className="flex-1">{children}</div>
            <div className="px-4 sm:px-6 lg:px-8">
              <SiteFooter />
            </div>
          </div>
        </div>
        <ThemeToggle />
      </body>
    </html>
  );
}
