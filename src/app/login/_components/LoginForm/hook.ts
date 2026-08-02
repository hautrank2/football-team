"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authApi } from "@/apis/auth";
import { useAuth } from "@/contexts";
import type { UseLoginFormProps } from "./type";

const schema = z.object({
  username: z.string().min(1, "Nhập tài khoản"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

export type LoginValues = z.infer<typeof schema>;

export const useLoginForm = ({ redirectTo = "/admin/teams" }: UseLoginFormProps) => {
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginValues) => authApi.login(values),
    onSuccess: (user) => {
      login({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      });
      toast.success("Đăng nhập thành công");
      router.push(redirectTo);
    },
    onError: () => toast.error("Sai tài khoản hoặc mật khẩu"),
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  return { form, onSubmit, isLoading: mutation.isPending };
};
