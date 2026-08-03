"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateTeam, useUpdateTeam } from "@/hooks";
import type { UseTeamFormDialogProps } from "./type";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  shortName: z.string().optional(),
  description: z.string().optional(),
});

export type TeamFormValues = z.infer<typeof schema>;

const EMPTY: TeamFormValues = { name: "", shortName: "", description: "" };

export const useTeamFormDialog = ({
  open,
  team,
  onOpenChange,
  onSuccess,
}: UseTeamFormDialogProps) => {
  const isEdit = !!team;
  const form = useForm<TeamFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  // Sync form when opening / switching the edited record.
  useEffect(() => {
    if (!open) return;
    form.reset(
      team
        ? { name: team.name, shortName: team.shortName ?? "", description: team.description ?? "" }
        : EMPTY
    );
  }, [open, team, form]);

  const create = useCreateTeam();
  const update = useUpdateTeam();
  const isLoading = create.isPending || update.isPending;

  const close = () => onOpenChange(false);

  const onSubmit = form.handleSubmit((values) => {
    // Drop empty optional strings so they are not stored as "".
    const body = {
      name: values.name,
      shortName: values.shortName || undefined,
      description: values.description || undefined,
    };

    const opts = {
      onSuccess: () => {
        toast.success(isEdit ? "Đã cập nhật đội" : "Đã tạo đội");
        onSuccess?.();
        close();
      },
      onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
    };

    if (isEdit && team) update.mutate({ id: team.id, body }, opts);
    else create.mutate(body, opts);
  });

  const clear = (field: keyof TeamFormValues) => form.setValue(field, "");

  return { form, onSubmit, isLoading, isEdit, clear, close };
};
