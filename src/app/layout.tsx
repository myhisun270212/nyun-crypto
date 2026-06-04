import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MobileNav } from "@/components/mobile-nav";
import { SidebarNav } from "@/components/sidebar-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trade Journal Pro",
  description: "Modern trading journal application",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} overflow-x-hidden`}
      >
        <div className="flex min-h-screen w-full overflow-x-hidden">
          <SidebarNav />

          <div className="flex flex-1 flex-col min-w-0">
            <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">
              {children}
            </main>

            <MobileNav />
          </div>
        </div>

        <Toaster />
      </body>
    </html>
  );
}