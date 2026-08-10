"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/contexts";
import { useChangePassword } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import type { HttpError } from "@/types";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu mới"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

type ChangePasswordValues = z.infer<typeof schema>;

export type ChangePasswordFormProps = {
  userId: string;
};

export const ChangePasswordForm = ({ userId }: ChangePasswordFormProps) => {
  const router = useRouter();
  const { logout } = useAuth();

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const mutation = useChangePassword();

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        id: userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          // Đổi mật khẩu xong → xoá phiên đăng nhập, buộc đăng nhập lại.
          toast.success("Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
          logout();
          router.replace("/login");
        },
        onError: (err) => {
          const raw = (err as unknown as HttpError)?.message;
          const message = typeof raw === "string" ? raw : "";
          if (message.includes("hiện tại")) {
            form.setError("currentPassword", { message: "Mật khẩu hiện tại không đúng" });
          }
          toast.error(message || "Không thể đổi mật khẩu");
        },
      }
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>
          Cần nhập mật khẩu hiện tại để xác nhận. Sau khi đổi, bạn sẽ được đăng
          xuất và cần đăng nhập lại.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <fieldset disabled={mutation.isPending} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhập lại mật khẩu mới</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                  <KeyRound className="size-4" />
                  {mutation.isPending ? "Đang lưu…" : "Đổi mật khẩu"}
                </Button>
              </div>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
