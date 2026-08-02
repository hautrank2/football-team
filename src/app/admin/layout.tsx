"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { useAuth } from "@/contexts";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  // Wait for auth to resolve; redirect handled above.
  if (!isReady || !user) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
