"use client";

import { LoaderCircle, Lock, LogIn, User } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
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

export type { LoginFormProps };

export const LoginForm = (props: LoginFormProps) => {
  const { form, onSubmit, isLoading, errorCount } = useLoginForm(props);
  const reduce = useReducedMotion();

  return (
    <motion.div
      // Lands from the right as the page opens…
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={
        reduce
          ? undefined
          : errorCount > 0
            ? // …and shakes its head on a rejected attempt. Keyed on the attempt
              // count so a second wrong password shakes again.
              { opacity: 1, y: 0, scale: 1, x: [0, -10, 10, -7, 7, -3, 0] }
            : { opacity: 1, y: 0, scale: 1 }
      }
      key={errorCount}
      transition={{ duration: errorCount > 0 ? 0.45 : 0.5, ease: "easeOut" }}
      className="relative w-full max-w-sm"
    >
      {/* Rotating conic glow behind the card — the only light source up here. */}
      <div className="pointer-events-none absolute -inset-6 -z-10 overflow-hidden rounded-3xl">
        <div className="animate-spin-slow absolute inset-[-40%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.35)_60deg,transparent_140deg,rgba(168,85,247,0.3)_220deg,transparent_300deg)] blur-2xl" />
      </div>

      {/* Gradient hairline border: a 1px gradient showing through the card edge. */}
      <div className="rounded-xl bg-gradient-to-br from-white/25 via-primary/40 to-white/10 p-px shadow-2xl shadow-primary/10">
        <Card className="w-full rounded-xl border-0 bg-[#0b1020]/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>Vào sân cùng anh em nào ⚽</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={onSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                <fieldset disabled={isLoading} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tài khoản</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                              placeholder="username"
                              autoComplete="username"
                              className="pl-9"
                              {...field}
                            />
                          </div>
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
                          <div className="group relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <PasswordInput
                              placeholder="••••••"
                              autoComplete="current-password"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Shine sweeps across the button on hover. */}
                  <Button
                    type="submit"
                    className="group relative mt-2 w-full overflow-hidden"
                  >
                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/25 transition-all duration-700 group-hover:left-[150%] motion-reduce:hidden" />
                    {isLoading ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <LogIn className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    )}
                    {isLoading ? "Đang đăng nhập…" : "Đăng nhập"}
                  </Button>
                </fieldset>
              </form>
            </Form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Chưa biết tài khoản?{" "}
              <Link
                href="/login/users"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Xem danh sách
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
