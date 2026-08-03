"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { PlayerUpdateDto } from "@/types";
import { usePlayer, useUpdatePlayer } from "@/hooks";
import { useAuth } from "@/contexts";

export const NONE = "__none__";

const optionalPosInt = (max: number, msg: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && +v >= 1 && +v <= max), msg);

const schema = z.object({
  fullName: z.string().min(1, "Bắt buộc"),
  nickname: z.string().optional(),
  title: z.string().min(1, "Chọn danh xưng"),
  maritalStatus: z.string().optional(),
  birthday: z.string().min(1, "Chọn ngày sinh"),
  jerseyNumber: optionalPosInt(99, "Số áo 1–99"),
  preferredFoot: z.enum(["LEFT", "RIGHT"]),
  weakFoot: z.string().regex(/^[1-5]$/, "1–5"),
  height: optionalPosInt(300, "Không hợp lệ"),
  weight: optionalPosInt(300, "Không hợp lệ"),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof schema>;

const toDateInput = (value: Date | string): string => new Date(value).toISOString().slice(0, 10);

export const useProfileScreen = () => {
  const router = useRouter();
  const { user, isReady, update: updateAuth } = useAuth();

  // Any signed-in user may view their own profile; guests go to login.
  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  const query = usePlayer(user?.id);
  const player = query.data;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      nickname: "",
      title: "",
      maritalStatus: NONE,
      birthday: "",
      jerseyNumber: "",
      preferredFoot: "RIGHT",
      weakFoot: "3",
      height: "",
      weight: "",
      bio: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (!player) return;
    const [left, right] = player.foot ?? [5, 3];
    const preferredFoot: "LEFT" | "RIGHT" = left >= right ? "LEFT" : "RIGHT";
    const weakFoot = String(preferredFoot === "LEFT" ? right : left);

    form.reset({
      fullName: player.fullName,
      nickname: player.nickname ?? "",
      title: player.title,
      maritalStatus: player.maritalStatus ?? NONE,
      birthday: player.birthday ? toDateInput(player.birthday) : "",
      jerseyNumber: player.jerseyNumber?.toString() ?? "",
      preferredFoot,
      weakFoot,
      height: player.height?.toString() ?? "",
      weight: player.weight?.toString() ?? "",
      bio: player.bio ?? "",
      avatarUrl: player.avatarUrl ?? "",
    });
  }, [player, form]);

  const mutation = useUpdatePlayer();

  const onSubmit = form.handleSubmit((values) => {
    if (!user) return;

    const body: PlayerUpdateDto = {
      fullName: values.fullName,
      title: values.title,
      birthday: new Date(values.birthday).toISOString(),
      foot: (values.preferredFoot === "LEFT"
        ? [5, Number(values.weakFoot)]
        : [Number(values.weakFoot), 5]) as [number, number],
      nickname: values.nickname || undefined,
      maritalStatus:
        values.maritalStatus && values.maritalStatus !== NONE ? values.maritalStatus : undefined,
      jerseyNumber: values.jerseyNumber ? Number(values.jerseyNumber) : undefined,
      height: values.height ? Number(values.height) : undefined,
      weight: values.weight ? Number(values.weight) : undefined,
      bio: values.bio || undefined,
      // Always sent so clearing the avatar takes effect.
      avatarUrl: values.avatarUrl || "",
    };

    mutation.mutate(
      { id: user.id, body },
      {
        onSuccess: () => {
          // Keep the header/sidebar in sync with the new name & avatar.
          updateAuth({ fullName: values.fullName, avatarUrl: values.avatarUrl || null });
          toast.success("Đã cập nhật hồ sơ");
        },
        onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
      }
    );
  });

  const clear = (field: keyof ProfileFormValues) => form.setValue(field, "");

  const headerName = useMemo(
    () => player?.fullName || user?.fullName || user?.username || "",
    [player, user]
  );

  return {
    user,
    player,
    headerName,
    isLoading: !isReady || query.isPending,
    isSaving: mutation.isPending,
    form,
    onSubmit,
    clear,
    NONE,
  };
};
