"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts";
import { usePlayer, usePlayerAttribute } from "@/hooks";
import { loginRedirectHref } from "@/utils/routing";

export const useProfilePage = () => {
  const router = useRouter();
  const { user, isReady } = useAuth();

  // Any signed-in user may view their own profile; guests go to login.
  useEffect(() => {
    if (isReady && !user) router.replace(loginRedirectHref());
  }, [isReady, user, router]);

  const playerQuery = usePlayer(user?.id);
  const attributeQuery = usePlayerAttribute(user?.id);

  return {
    user,
    player: playerQuery.data,
    // 404 (no attributes yet) surfaces as an error → treat as "none".
    attribute: attributeQuery.data ?? null,
    isLoading: !isReady || playerQuery.isPending,
    isAttributeLoading: attributeQuery.isPending,
  };
};
