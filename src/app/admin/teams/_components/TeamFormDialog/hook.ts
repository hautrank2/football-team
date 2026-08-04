"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { TeamModel } from "@/types";
import { useCreateTeam, useUpdateTeam } from "@/hooks";
import type { TeamFormProps } from "./type";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  shortName: z.string().optional(),
  description: z.string().optional(),
});

export type TeamFormValues = z.infer<typeof schema>;

export const DEFAULT_VALUES: TeamFormValues = { name: "", shortName: "", description: "" };

// Map a team row → form values (edit). Null/undefined → empty (create).
export const toTeamFormValues = (team?: TeamModel | null): TeamFormValues =>
  team
    ? { name: team.name, shortName: team.shortName ?? "", description: team.description ?? "" }
    : DEFAULT_VALUES;

export const useTeamForm = ({
  isEdit,
  teamId,
  defaultValues,
  onStartSubmit,
  onSuccess,
  onError,
}: TeamFormProps) => {
  const form = useForm<TeamFormValues>({ resolver: zodResolver(schema), defaultValues });

  const create = useCreateTeam();
  const update = useUpdateTeam();
  const isLoading = create.isPending || update.isPending;

  const onSubmit = form.handleSubmit((values) => {
    onStartSubmit?.();

    // Drop empty optional strings so they are not stored as "".
    const body = {
      name: values.name,
      shortName: values.shortName || undefined,
      description: values.description || undefined,
    };

    const opts = {
      onSuccess: () => {
        toast.success(isEdit ? "Đã cập nhật đội" : "Đã tạo đội");
        onSuccess();
      },
      onError: (error: unknown) => {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
        onError?.(error);
      },
    };

    if (isEdit && teamId) update.mutate({ id: teamId, body }, opts);
    else create.mutate(body, opts);
  });

  const clear = (field: keyof TeamFormValues) => form.setValue(field, "");

  return { form, onSubmit, isLoading, clear };
};
