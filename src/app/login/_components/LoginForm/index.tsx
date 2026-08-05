"use client";

import { LogIn } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLoginForm } from "./hook";
import type { LoginFormProps } from "./type";
import Link from "next/link";

export type { LoginFormProps };

export const LoginForm = (props: LoginFormProps) => {
  const { form, onSubmit, isLoading } = useLoginForm(props);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>Khu vực quản trị</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <fieldset disabled={isLoading} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tài khoản</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2 w-full">
                <LogIn className="size-4" />
                {isLoading ? "Đang đăng nhập…" : "Đăng nhập"}
              </Button>
            </fieldset>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Chưa biết tài khoản?{" "}
          <Link
            href="/login/users"
            className="font-medium text-primary hover:underline"
          >
            Xem danh sách
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
