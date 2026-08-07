"use client";

import { endOfDay, format, isSameDay, parse, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarPlus, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateMatch, useMatches, useMatchVotes } from "@/hooks/schedule";
import { matchHref } from "@/utils/routing";

const errMsg = (e: unknown) => String((e as { message?: unknown })?.message ?? "Lỗi");

const AdminMatchesPage = () => {
  const [day, setDay] = useState<string>(""); // yyyy-MM-dd
  const [location, setLocation] = useState("");

  const dayDate = useMemo(() => (day ? parse(day, "yyyy-MM-dd", new Date()) : undefined), [day]);

  const votesQuery = useMatchVotes(
    dayDate
      ? {
          startVoteDateAt: startOfDay(dayDate).toISOString(),
          endVoteDateAt: endOfDay(dayDate).toISOString(),
          pageSize: 200,
          populations: ["player"],
        }
      : { pageSize: 0 }
  );
  const votes = dayDate ? votesQuery.data?.items ?? [] : [];

  const matchesQuery = useMatches({ pageSize: 100, sortBy: "matchDate", order: "desc" });
  const matches = matchesQuery.data?.items ?? [];
  const existing = dayDate ? matches.find((m) => isSameDay(new Date(m.matchDate), dayDate)) : undefined;

  const create = useCreateMatch();
  const onCreate = () => {
    if (!dayDate) return;
    create.mutate(
      { matchDate: startOfDay(dayDate).toISOString(), location: location || undefined },
      {
        onSuccess: () => {
          toast.success("Đã tạo trận");
          setLocation("");
        },
        onError: (e) => toast.error(errMsg(e)),
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Trận đấu</h1>

      {/* Confirm a day into a match */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Chốt trận từ vote</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-48">
              <Label className="text-xs">Ngày</Label>
              <DatePicker value={day} onChange={setDay} placeholder="Chọn ngày" />
            </div>
            <div className="flex-1 min-w-48">
              <Label className="text-xs">Sân (tuỳ chọn)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Tên sân" />
            </div>
          </div>

          {dayDate ? (
            existing ? (
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>Ngày này đã có trận đấu.</span>
                <Button asChild size="sm" variant="outline">
                  <Link href={matchHref(existing.id)}>
                    Xem trận <ExternalLink className="size-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <div className="border-b px-3 py-2 text-sm text-muted-foreground">
                    <Users className="mr-1 inline size-4" />
                    {votes.length} người vote ({votes.reduce((s, v) => s + 1 + v.guestCount, 0)} suất)
                  </div>
                  <ul className="max-h-56 divide-y overflow-y-auto text-sm">
                    {votes.map((v) => (
                      <li key={v.id} className="flex justify-between px-3 py-1.5">
                        <span>{v.player?.fullName ?? v.player?.username ?? v.playerId}</span>
                        {v.guestCount ? <span className="text-muted-foreground">+{v.guestCount} khách</span> : null}
                      </li>
                    ))}
                    {votes.length === 0 ? (
                      <li className="px-3 py-2 text-muted-foreground">Chưa có ai vote ngày này.</li>
                    ) : null}
                  </ul>
                </div>
                <Button onClick={onCreate} disabled={votes.length === 0 || create.isPending} className="w-fit">
                  <CalendarPlus className="size-4" />
                  Tạo trận
                </Button>
              </>
            )
          ) : null}
        </CardContent>
      </Card>

      {/* Existing matches */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tất cả trận đấu</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {matches.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Chưa có trận nào.</p>
          ) : (
            matches.map((m) => (
              <Link
                key={m.id}
                href={matchHref(m.id)}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <span className="capitalize">
                  {format(new Date(m.matchDate), "EEEE, dd/MM/yyyy", { locale: vi })}
                </span>
                <span className="flex items-center gap-2">
                  {m.fieldCost == null ? <Badge variant="outline">Chưa nhập tiền</Badge> : null}
                  <ExternalLink className="size-4 text-muted-foreground" />
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMatchesPage;
