import ClientOnly from "@/components/ClientOnly";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WonHtan Lay — ဝန်ထမ်းလေး",
  description:
    "WonHtan Lay — ဝန်ထမ်းလေး။ Myanmar online shop owners အတွက် 24/7 order automation, slip verification, and delivery slip generation.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07111f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions / preview tooling may stamp
    // extra attributes (e.g. `bis_*`) onto <html>/<body> before React hydrates.
    // App content itself renders inside <ClientOnly>, so it cannot mismatch.
    <html lang="my" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientOnly>
          <ErrorBoundary>
            <ThemeProvider defaultTheme="light" switchable>
              <TooltipProvider>
                <Toaster />
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </ClientOnly>
      </body>
    </html>
  );
}
