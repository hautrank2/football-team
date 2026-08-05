"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts";
import { useLineup } from "@/hooks";
import { loginRedirectHref } from "@/utils/routing";

export const useEditLineupPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user, isReady } = useAuth();

  const query = useLineup(id);
  const lineup = query.data;

  // Only the owner may edit. Guests → login; non-owners → the public view.
  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace(loginRedirectHref());
      return;
    }
    if (query.isSuccess && lineup && lineup.ownerId !== user.id) {
      router.replace(`/lineups/${lineup.id}`);
    }
  }, [isReady, user, query.isSuccess, lineup, router]);

  const isOwner = !!user && !!lineup && lineup.ownerId === user.id;

  return {
    user,
    lineup,
    isOwner,
    isLoading: !isReady || query.isPending,
    isError: query.isError,
  };
};
