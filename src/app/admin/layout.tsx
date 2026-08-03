"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AdminSidebar } from "./_components/AdminSidebar";
import { useAuth } from "@/contexts";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, isReady } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isReady) return;
    // Not signed in → login. Signed in but not an admin → own profile.
    if (!user) router.replace("/login");
    else if (!isAdmin) router.replace("/profile");
  }, [isReady, user, isAdmin, router]);

  // Wait for auth to resolve; redirect handled above.
  if (!isReady || !user || !isAdmin) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
