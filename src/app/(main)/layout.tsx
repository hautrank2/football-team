import type { ReactNode } from "react";
import Header from "@/components/layouts/header";

const MainLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Header />
    <main className="pt-16">{children}</main>
  </>
);

export default MainLayout;
