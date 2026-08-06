"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatePicker } from "@/components/ui/date-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AvatarUpload } from "@/components/admin/AvatarUpload";
import { ClearableInput } from "@/components/admin/ClearableInput";
import { SocialsInput } from "@/components/admin/SocialsInput";
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PLAYER_POSITION_OPTIONS,
  PLAYER_TITLE_OPTIONS,
} from "@/lib/player-meta";
import { toFormValues, usePlayerForm } from "./hook";
import type { PlayerFormDialogProps, PlayerFormProps } from "./type";

export type { PlayerFormDialogProps };
export { toFormValues } from "./hook";

const FOOT = ["1", "2", "3", "4", "5"];

// Outer Dialog (form-rule: Dialog + Form are two separate components). It owns
// open/close and remounts <PlayerForm> per open via `key`, so react-hook-form
// re-initialises from fresh defaultValues each time (no stale-record leak).
export const PlayerFormDialog = ({
  open,
  player,
  onOpenChange,
  onSuccess,
}: PlayerFormDialogProps) => {
  const isEdit = !!player;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa cầu thủ" : "Thêm cầu thủ"}</DialogTitle>
        </DialogHeader>

        {open ? (
          <PlayerForm
            key={player?.id ?? "new"}
            isEdit={isEdit}
            playerId={player?.id}
            defaultValues={toFormValues(player)}
            onSuccess={() => {
              onSuccess?.();
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

// Inner Form component. Fully controlled by props; no dialog/open state here.
// Exported so pages can render it inline (without the Dialog wrapper).
export const PlayerForm = (props: PlayerFormProps) => {
  const { form, onSubmit, isLoading, isEdit, teamOptions, clear, NONE } =
    usePlayerForm(props);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {/* Loading state disables every field + button while submitting. */}
        <fieldset
          disabled={isLoading}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Ảnh đại diện</FormLabel>
                <AvatarUpload
                  value={field.value}
                  onChange={(url) => field.onChange(url ?? "")}
                  playerId={props.playerId}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tài khoản *</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
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
                <FormLabel>{isEdit ? "Mật khẩu mới" : "Mật khẩu *"}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={isEdit ? "Để trống nếu không đổi" : "••••••"}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
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
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biệt danh</FormLabel>
                <FormControl>
                  <ClearableInput
                    placeholder="Biệt danh"
                    {...field}
                    onClear={() => clear("nickname")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
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
                  <SelectContent className="max-h-60 overflow-y-auto">
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
            control={form.control}
            name="positions"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Vị trí</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex-wrap justify-start gap-2"
                  >
                    {PLAYER_POSITION_OPTIONS.map((o) => (
                      <ToggleGroupItem
                        key={o.value}
                        value={o.value}
                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {o.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đội</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn đội" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Không thuộc đội</SelectItem>
                    {teamOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
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
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {GENDER_OPTIONS.map((o) => (
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
            control={form.control}
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
                    <SelectItem value={NONE}>Không rõ</SelectItem>
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
            control={form.control}
            name="jerseyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số áo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    placeholder="1–99"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
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
                      Chân thuận mặc định 5 điểm; ô bên cạnh là điểm chân không
                      thuận (1–5).
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
                    value={form.watch("weakFoot")}
                    onValueChange={(v) => form.setValue("weakFoot", v)}
                  >
                    <SelectTrigger
                      className="w-16 shrink-0"
                      aria-label="Điểm chân không thuận"
                    >
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input type="tel" inputMode="numeric" placeholder="10–11 chữ số" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Giới thiệu</FormLabel>
                <FormControl>
                  <ClearableInput
                    placeholder="Vài dòng…"
                    {...field}
                    onClear={() => clear("bio")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="socials"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Mạng xã hội</FormLabel>
                <FormControl>
                  <SocialsInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={props.onCancel}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
