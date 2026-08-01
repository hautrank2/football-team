import type { ReactNode } from "react";
import Header from "@/components/layouts/header";
import { Providers } from "@/contexts";

// App-level providers (TanStack Query + app context) are mounted once here.
const MainLayout = ({ children }: { children: ReactNode }) => (
  <Providers>
    <Header />
    <main className="pt-16">{children}</main>
  </Providers>
);

export default MainLayout;
