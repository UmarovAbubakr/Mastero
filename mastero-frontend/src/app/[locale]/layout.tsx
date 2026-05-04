import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { ThemeProvider } from "../../components/ui/theme-provider";
import { StoreProvider } from "../../store/StoreProvider";
import { Navbar } from "@/src/components/navbar";
import { Footer } from "@/src/components/footer";
import { Toaster } from "@/src/components/ui/sonner";
import { AuthGuard } from "@/src/components/AuthGuard";
import { CompareBar } from "@/src/components/ui/compare-bar";
import AIAssistant from "@/src/components/AIAssistant";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Mastero',
  description: 'Найдите лучших фрилансеров для любой задачи',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.svg',
        sizes: 'any',
        }
    ],
    apple: '/apple-touch-icon.png',
  },
};

import React, { Suspense } from "react";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <StoreProvider>
              <Suspense fallback={null}>
                <Navbar />
                <AuthGuard>
                  {children}
                </AuthGuard>
                <Footer />
                <Toaster />
                <CompareBar />
                <AIAssistant />
              </Suspense>
            </StoreProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
