"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AvatarUpload } from "@/components/admin/AvatarUpload";
import { ClearableInput } from "@/components/admin/ClearableInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts";
import { useUpdatePlayer } from "@/hooks";
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PLAYER_POSITION_OPTIONS,
  PLAYER_TITLE_OPTIONS,
} from "@/lib/player-meta";
import type { PlayerModel, PlayerUpdateDto } from "@/types";

const NONE = "__none__";
const FOOT = ["1", "2", "3", "4", "5"];

const optionalPosInt = (max: number, msg: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && +v >= 1 && +v <= max), msg);

const schema = z.object({
  fullName: z.string().min(1, "Bắt buộc"),
  nickname: z.string().optional(),
  title: z.string().min(1, "Chọn danh xưng"),
  positions: z.array(z.string()),
  gender: z.string().min(1, "Chọn giới tính"),
  maritalStatus: z.string().optional(),
  birthday: z.string().min(1, "Chọn ngày sinh"),
  jerseyNumber: optionalPosInt(99, "Số áo 1–99"),
  preferredFoot: z.enum(["LEFT", "RIGHT"]),
  weakFoot: z.string().regex(/^[1-5]$/, "1–5"),
  height: optionalPosInt(300, "Không hợp lệ"),
  weight: optionalPosInt(300, "Không hợp lệ"),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof schema>;

const toDateInput = (value: Date | string): string => new Date(value).toISOString().slice(0, 10);

// NOTE: mounted with `key={player.id}` by the parent, so defaultValues fully
// initialise the form (including the Radix Select) at mount — avoiding the
// reset-after-mount pitfall where the title Select wouldn't reflect its value.
export const ProfileInfoForm = ({ player }: { player: PlayerModel }) => {
  const { update: updateAuth } = useAuth();

  const [left, right] = player.foot ?? [5, 3];
  const preferredFoot: "LEFT" | "RIGHT" = left >= right ? "LEFT" : "RIGHT";
  const weakFoot = String(preferredFoot === "LEFT" ? right : left);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: player.fullName,
      nickname: player.nickname ?? "",
      title: player.title,
      positions: player.positions ?? [],
      gender: player.gender ?? "MALE",
      maritalStatus: player.maritalStatus ?? NONE,
      birthday: player.birthday ? toDateInput(player.birthday) : "",
      jerseyNumber: player.jerseyNumber?.toString() ?? "",
      preferredFoot,
      weakFoot,
      height: player.height?.toString() ?? "",
      weight: player.weight?.toString() ?? "",
      bio: player.bio ?? "",
      avatarUrl: player.avatarUrl ?? "",
    },
  });

  const mutation = useUpdatePlayer();

  const onSubmit = form.handleSubmit((values) => {
    const body: PlayerUpdateDto = {
      fullName: values.fullName,
      title: values.title,
      positions: values.positions,
      gender: values.gender,
      birthday: new Date(values.birthday).toISOString(),
      foot: (values.preferredFoot === "LEFT"
        ? [5, Number(values.weakFoot)]
        : [Number(values.weakFoot), 5]) as [number, number],
      nickname: values.nickname || undefined,
      maritalStatus:
        values.maritalStatus && values.maritalStatus !== NONE ? values.maritalStatus : undefined,
      jerseyNumber: values.jerseyNumber ? Number(values.jerseyNumber) : undefined,
      height: values.height ? Number(values.height) : undefined,
      weight: values.weight ? Number(values.weight) : undefined,
      bio: values.bio || undefined,
      avatarUrl: values.avatarUrl || "",
    };

    mutation.mutate(
      { id: player.id, body },
      {
        onSuccess: () => {
          updateAuth({ fullName: values.fullName, avatarUrl: values.avatarUrl || null });
          toast.success("Đã cập nhật hồ sơ");
        },
        onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
      }
    );
  });

  const clear = (field: keyof ProfileFormValues) => form.setValue(field, "");

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <fieldset disabled={mutation.isPending} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Ảnh đại diện</FormLabel>
                    <AvatarUpload
                      value={field.value}
                      onChange={(url) => field.onChange(url ?? "")}
                      playerId={player.id}
                      onSaved={(url) => updateAuth({ avatarUrl: url || null })}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className="text-muted-foreground">Tài khoản</Label>
                <Input value={player.username} disabled readOnly />
              </div>

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
                      <SelectContent>
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
                      <Input type="number" min={1} max={99} placeholder="1–99" {...field} />
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
                        value={form.watch("weakFoot")}
                        onValueChange={(v) => form.setValue("weakFoot", v)}
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
            </fieldset>

            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Đang lưu…" : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
