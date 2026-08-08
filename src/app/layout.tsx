import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import { Providers } from "@/contexts";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./index.css";

const sans = Oswald({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Footboys",
  description: "Football players and teams",
};

// Apply the persisted theme before first paint to avoid a flash of the wrong
// theme. Defaults to dark. Kept in sync with <ThemeProvider>.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="dark";var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.classList.toggle("light",t==="light");}catch(e){}})();`;

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="vi" className={cn(sans.className, "dark")} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </head>
    <body className="antialiased">
      <Providers>{children}</Providers>
      <Toaster richColors position="top-right" />
    </body>
  </html>
);

export default RootLayout;
