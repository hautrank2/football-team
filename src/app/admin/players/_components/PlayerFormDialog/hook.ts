"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { PlayerCreateDto, PlayerUpdateDto } from "@/types";
import { useCreatePlayer, useTeams, useUpdatePlayer } from "@/hooks";
import type { UsePlayerFormDialogProps } from "./type";

export const NONE = "__none__";

const optionalPosInt = (max: number, msg: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && +v >= 1 && +v <= max), msg);

const makeSchema = (isEdit: boolean) =>
  z.object({
    username: z.string().min(3, "Tối thiểu 3 ký tự"),
    // Create requires a password; edit leaves it blank to keep the current one.
    password: isEdit
      ? z.string().min(6, "Tối thiểu 6 ký tự").or(z.literal("")).optional()
      : z.string().min(6, "Tối thiểu 6 ký tự"),
    fullName: z.string().min(1, "Bắt buộc"),
    nickname: z.string().optional(),
    title: z.string().min(1, "Chọn danh xưng"),
    teamId: z.string().optional(),
    maritalStatus: z.string().optional(),
    birthday: z.string().min(1, "Chọn ngày sinh"),
    jerseyNumber: optionalPosInt(99, "Số áo 1–99"),
    preferredFoot: z.enum(["LEFT", "RIGHT"]), // chân thuận (điểm = 5)
    weakFoot: z.string().regex(/^[1-5]$/, "1–5"), // chân còn lại
    height: optionalPosInt(300, "Không hợp lệ"),
    weight: optionalPosInt(300, "Không hợp lệ"),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
  });

export type PlayerFormValues = z.infer<ReturnType<typeof makeSchema>>;

const toDateInput = (value: Date | string): string => new Date(value).toISOString().slice(0, 10);

export const usePlayerFormDialog = ({
  open,
  player,
  onOpenChange,
  onSuccess,
}: UsePlayerFormDialogProps) => {
  const isEdit = !!player;
  const schema = useMemo(() => makeSchema(isEdit), [isEdit]);

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      nickname: "",
      title: "",
      teamId: NONE,
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
    if (!open) return;
    if (player) {
      // Derive preferred foot (the one rated highest = 5) + the weaker foot's score.
      const [left, right] = player.foot ?? [5, 3];
      const preferredFoot: "LEFT" | "RIGHT" = left >= right ? "LEFT" : "RIGHT";
      const weakFoot = String(preferredFoot === "LEFT" ? right : left);

      form.reset({
        username: player.username,
        password: "",
        fullName: player.fullName,
        nickname: player.nickname ?? "",
        title: player.title,
        teamId: player.teamId ?? NONE,
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
    } else {
      form.reset();
    }
  }, [open, player, form]);

  // Team options for the select.
  const teamsQuery = useTeams({ page: 1, pageSize: 100, sortBy: "name", order: "asc" });
  const teamOptions = teamsQuery.data?.items ?? [];

  const create = useCreatePlayer();
  const update = useUpdatePlayer();
  const isLoading = create.isPending || update.isPending;

  const close = () => onOpenChange(false);

  const onSubmit = form.handleSubmit((values) => {
    const common = {
      username: values.username,
      fullName: values.fullName,
      title: values.title,
      birthday: new Date(values.birthday).toISOString(),
      // Preferred foot is fixed at 5; the other foot uses the entered score.
      foot: (values.preferredFoot === "LEFT"
        ? [5, Number(values.weakFoot)]
        : [Number(values.weakFoot), 5]) as [number, number],
      nickname: values.nickname || undefined,
      teamId: values.teamId && values.teamId !== NONE ? values.teamId : undefined,
      maritalStatus:
        values.maritalStatus && values.maritalStatus !== NONE ? values.maritalStatus : undefined,
      jerseyNumber: values.jerseyNumber ? Number(values.jerseyNumber) : undefined,
      height: values.height ? Number(values.height) : undefined,
      weight: values.weight ? Number(values.weight) : undefined,
      bio: values.bio || undefined,
    };

    const opts = {
      onSuccess: () => {
        toast.success(isEdit ? "Đã cập nhật cầu thủ" : "Đã tạo cầu thủ");
        onSuccess?.();
        close();
      },
      onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
    };

    if (isEdit && player) {
      const body: PlayerUpdateDto = { ...common };
      if (values.password) body.password = values.password;
      update.mutate({ id: player.id, body }, opts);
    } else {
      const body: PlayerCreateDto = {
        ...common,
        password: values.password as string,
        avatarUrl: values.avatarUrl || undefined,
      };
      create.mutate(body, opts);
    }
  });

  const clear = (field: keyof PlayerFormValues) => form.setValue(field, "");

  return { form, onSubmit, isLoading, isEdit, teamOptions, clear, close, NONE };
};
