"use client";

import { Save, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SIZE_OPTIONS } from "@/lib/lineup-meta";
import { cn } from "@/lib/utils";
import type { PlayerModel } from "@/types";
import { PitchField } from "../PitchField";
import { PlayerToken } from "../PlayerToken";
import { useLineupForm } from "./hook";
import type { LineupFormProps } from "./type";

export type { LineupFormProps };

const avatarOf = (p: PlayerModel) => p.avatarNoBg || p.avatarUrl || undefined;

export const LineupForm = (props: LineupFormProps) => {
  const s = useLineupForm(props);
  const router = useRouter();

  return (
    <Form {...s.form}>
      <form onSubmit={s.onSubmit} noValidate className="flex flex-col gap-6">
        {/* ── Config ─────────────────────────────────────────── */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={s.form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Tên đội hình *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Đội hình sân 7 tối thứ 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Loại sân</Label>
              <Select value={s.size} onValueChange={(v) => s.changeSize(v as typeof s.size)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sơ đồ</Label>
              <Select value={s.formation} onValueChange={s.changeFormation}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {s.formations.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={s.form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-3">
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Chiến thuật, người thay thế, lưu ý…"
                      className="min-h-[40px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={s.form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>Chia sẻ</FormLabel>
                  <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    Công khai
                  </label>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Pitch + bench ──────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Pitch */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Kéo cầu thủ từ danh sách vào vị trí. Kéo ra ngoài sân để bỏ.
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  s.placedCount === s.totalCount
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s.placedCount}/{s.totalCount}
              </span>
            </div>

            <div className="mx-auto w-full max-w-md">
              <PitchField ref={s.pitchRef}>
                {s.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  >
                    <PlayerToken
                      player={slot.playerId ? s.playersById.get(slot.playerId) : undefined}
                      isCaptain={slot.isCaptain}
                      interactive
                      onPointerDown={(e) => s.startDragSlot(i, e)}
                      onToggleCaptain={() => s.toggleCaptain(i)}
                      onRemove={() => s.clearSlot(i)}
                    />
                  </div>
                ))}
              </PitchField>
            </div>
          </div>

          {/* Bench */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="size-4" />
              Cầu thủ ({s.bench.length})
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={s.search}
                onChange={(e) => s.setSearch(e.target.value)}
                placeholder="Tìm cầu thủ…"
                className="pl-8"
              />
            </div>

            <div className="max-h-[28rem] overflow-y-auto rounded-lg border p-2 lg:max-h-[32rem]">
              {s.isLoadingPlayers ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Đang tải…</div>
              ) : s.bench.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Không còn cầu thủ nào
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {s.bench.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onPointerDown={(e) => s.startDragBench(p.id, e)}
                        style={{ touchAction: "none" }}
                        className="flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-accent active:cursor-grabbing"
                      >
                        <Avatar className="size-9 border">
                          <AvatarImage src={avatarOf(p)} className="object-cover" />
                          <AvatarFallback className="text-xs">
                            {p.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{p.fullName}</div>
                          {p.nickname ? (
                            <div className="truncate text-xs text-muted-foreground">
                              {p.nickname}
                            </div>
                          ) : null}
                        </div>
                        {p.jerseyNumber != null ? (
                          <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                            #{p.jerseyNumber}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/lineup")}>
            Hủy
          </Button>
          <Button type="submit" disabled={s.isSaving}>
            <Save className="size-4" />
            {s.isSaving ? "Đang lưu…" : props.mode === "create" ? "Tạo đội hình" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>

      {/* Drag ghost */}
      {s.ghost && s.ghostPlayer ? (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: s.ghost.x, top: s.ghost.y }}
        >
          <PlayerToken player={s.ghostPlayer} />
        </div>
      ) : null}
    </Form>
  );
};
