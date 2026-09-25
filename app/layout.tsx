import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/AppLayout";
import { Noto_Sans_Lao } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { PwaProvider, InstallBanner } from "@/components/pwa";

const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: "%s | ລະບົບແຈ້ງເຕືອນປະຊຸມ",
    default: "ລະບົບແຈ້ງເຕືອນປະຊຸມ (EDL Meeting Notice)",
  },
  description: "ລະບົບແຈ້ງເຕືອນ ແລະ ຕິດຕາມເອກະສານກອງປະຊຸມ EDL",
  applicationName: "ລະບົບແຈ້ງເຕືອນປະຊຸມ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EDL Meeting",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: import("next").Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo" suppressHydrationWarning className={cn("font-sans", notoSansLao.variable)}>
      <body className="min-h-screen relative">
        {/* Modern Smooth Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-theme-bg transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(var(--brand),0.05)]"></div>

          {/* Animated Glowing Orbs - Soft Mesh Gradient */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[rgba(var(--brand),0.12)] rounded-full blur-[120px] animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-[rgba(56,189,248,0.12)] rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2000ms' }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-[rgba(99,102,241,0.12)] rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4000ms' }}></div>
        </div>

        <ThemeProvider>
          <PwaProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <InstallBanner />
            <ToastContainer position="top-right" />
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
