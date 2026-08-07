import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import { Providers } from "@/contexts";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

const sans = Oswald({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Đá phủi",
  description: "Football players and teams",
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
