"use client";

import { Info } from "lucide-react";
import { AvatarUpload } from "@/components/admin/AvatarUpload";
import { ClearableInput } from "@/components/admin/ClearableInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MARITAL_STATUS_OPTIONS, PLAYER_TITLE_OPTIONS } from "@/lib/player-meta";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import { useProfilePage } from "./hook";

const FOOT = ["1", "2", "3", "4", "5"];

const ProfilePage = () => {
  const s = useProfilePage();

  if (s.isLoading || !s.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Hồ sơ của tôi</h1>
        <Badge variant="secondary">{s.user.role === "ADMIN" ? "Quản trị" : "Cầu thủ"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...s.form}>
            <form onSubmit={s.onSubmit} noValidate className="flex flex-col gap-4">
              <fieldset disabled={s.isSaving} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={s.form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Ảnh đại diện</FormLabel>
                      <AvatarUpload value={field.value} onChange={(url) => field.onChange(url ?? "")} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Tài khoản</Label>
                  <Input value={s.user.username} disabled readOnly />
                </div>

                <FormField
                  control={s.form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên *</FormLabel>
                      <FormControl>
                        <Input placeholder="Họ và tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biệt danh</FormLabel>
                      <FormControl>
                        <ClearableInput
                          placeholder="Biệt danh"
                          {...field}
                          onClear={() => s.clear("nickname")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh xưng *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn danh xưng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLAYER_TITLE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh *</FormLabel>
                      <DatePicker value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hôn nhân</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={s.NONE}>Không rõ</SelectItem>
                          {MARITAL_STATUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="jerseyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số áo</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={99} placeholder="1–99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="preferredFoot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Chân thuận *
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="text-muted-foreground">
                              <Info className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Chân thuận mặc định 5 điểm; ô bên cạnh là điểm chân không thuận (1–5).
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <div className="flex gap-2">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn chân thuận" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LEFT">Chân trái</SelectItem>
                            <SelectItem value="RIGHT">Chân phải</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={s.form.watch("weakFoot")}
                          onValueChange={(v) => s.form.setValue("weakFoot", v)}
                        >
                          <SelectTrigger className="w-16 shrink-0" aria-label="Điểm chân không thuận">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FOOT.map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chiều cao (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="cm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cân nặng (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={s.form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Giới thiệu</FormLabel>
                      <FormControl>
                        <ClearableInput
                          placeholder="Vài dòng…"
                          {...field}
                          onClear={() => s.clear("bio")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>

              <div className="flex justify-end">
                <Button type="submit" disabled={s.isSaving}>
                  {s.isSaving ? "Đang lưu…" : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ChangePasswordForm userId={s.user.id} />
    </div>
  );
};

export default ProfilePage;
