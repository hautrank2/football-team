import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/contexts";
import { Toaster } from "@/components/ui/sonner";

const sans = Oswald({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "App",
  description: "A new project.",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="vi" className={sans.className}>
    <body className="antialiased dark">
      <Providers>{children}</Providers>
      <Toaster richColors position="top-right" />
    </body>
  </html>
);

export default RootLayout;
