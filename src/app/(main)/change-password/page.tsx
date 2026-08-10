"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts";
import { loginRedirectHref } from "@/utils/routing";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";

const ChangePasswordPage = () => {
  const router = useRouter();
  const { user, isReady } = useAuth();

  // Login required — guests bounce to the login flow.
  useEffect(() => {
    if (isReady && !user) router.replace(loginRedirectHref());
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Đổi mật khẩu</h1>
      <ChangePasswordForm userId={user.id} />
    </div>
  );
};

export default ChangePasswordPage;
