"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { PlayerCreateInput, PlayerUpdateInput } from "@/apis/player";
import { useCreatePlayer, useUpdatePlayer } from "@/apis/player/queries";
import { useTeams } from "@/apis/team/queries";
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
    footLeft: z.string().regex(/^[1-5]$/, "1–5"),
    footRight: z.string().regex(/^[1-5]$/, "1–5"),
    height: optionalPosInt(300, "Không hợp lệ"),
    weight: optionalPosInt(300, "Không hợp lệ"),
    bio: z.string().optional(),
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
      footLeft: "3",
      footRight: "3",
      height: "",
      weight: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (player) {
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
        footLeft: player.foot?.[0]?.toString() ?? "3",
        footRight: player.foot?.[1]?.toString() ?? "3",
        height: player.height?.toString() ?? "",
        weight: player.weight?.toString() ?? "",
        bio: player.bio ?? "",
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
      foot: [Number(values.footLeft), Number(values.footRight)] as [number, number],
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
      const body: PlayerUpdateInput = { ...common };
      if (values.password) body.password = values.password;
      update.mutate({ id: player.id, body }, opts);
    } else {
      const body: PlayerCreateInput = { ...common, password: values.password as string };
      create.mutate(body, opts);
    }
  });

  const clear = (field: keyof PlayerFormValues) => form.setValue(field, "");

  return { form, onSubmit, isLoading, isEdit, teamOptions, clear, close, NONE };
};
