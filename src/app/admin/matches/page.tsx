"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarPlus, ChevronRight, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { QuickMatchDialog } from "@/components/schedule/QuickMatchDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVnd } from "@/lib/format";
import { useMatches } from "@/hooks/schedule";
import { adminMatchHref } from "@/utils/routing";
import type { MatchModel } from "@/types";

// Derived, not read from match.status: the app never auto-transitions
// SCHEDULED → FINISHED, so a kicked-off match must still read as "Đã đá".
const displayStatus = (m: MatchModel, now: Date) => {
  if (m.status === "CANCELLED")
    return { label: "Đã huỷ", variant: "outline" as const };
  if (new Date(m.kickoffAt).getTime() <= now.getTime())
    return { label: "Đã đá", variant: "default" as const };
  return { label: "Sắp đá", variant: "secondary" as const };
};

const AdminMatchesPage = () => {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useMatches({
    pageSize: 100,
    sortBy: "matchDate",
    order: "desc",
    populations: ["players", "mvpPlayers"],
  });
  const matches = data?.items ?? [];

  // Club-wide totals across every listed match — the number an admin actually
  // chases is "how much is still owed to me".
  const totals = matches.reduce(
    (acc, m) => {
      const ps = m.players ?? [];
      acc.due += ps.reduce((s, p) => s + (p.isPaid ? 0 : p.amountDue), 0);
      acc.paid += ps.reduce((s, p) => s + (p.isPaid ? p.amountDue : 0), 0);
      acc.unsettled += m.fieldCost == null ? 1 : 0;
      return acc;
    },
    { due: 0, paid: 0, unsettled: 0 },
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Trận đấu</h1>
          <p className="text-sm text-muted-foreground">
            {matches.length} trận · đã thu {formatVnd(totals.paid)} · còn thiếu{" "}
            <span className="font-medium text-foreground">
              {formatVnd(totals.due)}
            </span>
            {totals.unsettled
              ? ` · ${totals.unsettled} trận chưa nhập tiền sân`
              : ""}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <CalendarPlus className="size-4" />
          Thêm trận đấu
        </Button>
      </div>

      <QuickMatchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(matchId) => router.push(adminMatchHref(matchId))}
      />

      <Card className="p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Chưa có trận nào.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Trận</TableHead>
                  <TableHead className="px-2">Sân</TableHead>
                  <TableHead className="px-2">Trạng thái</TableHead>
                  <TableHead className="px-2 text-center">Tham gia</TableHead>
                  <TableHead className="px-2 text-center">Bàn</TableHead>
                  <TableHead className="px-2">MVP</TableHead>
                  <TableHead className="px-2 text-right">Tiền sân</TableHead>
                  <TableHead className="px-2 text-right">Đã thu</TableHead>
                  <TableHead className="px-2 text-right">Còn thiếu</TableHead>
                  <TableHead className="w-10 px-2" aria-label="Mở" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((m) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    now={now}
                    onOpen={() => router.push(adminMatchHref(m.id))}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMatchesPage;

const MatchRow = ({
  match,
  now,
  onOpen,
}: {
  match: MatchModel;
  now: Date;
  onOpen: () => void;
}) => {
  const players = match.players ?? [];
  const heads = players.reduce((s, p) => s + 1 + p.guestCount, 0);
  const goals = players.reduce((s, p) => s + p.goals, 0);
  const paid = players.reduce((s, p) => s + (p.isPaid ? p.amountDue : 0), 0);
  const due = players.reduce((s, p) => s + (p.isPaid ? 0 : p.amountDue), 0);
  const status = displayStatus(match, now);
  const mvps = match.mvpPlayers ?? [];

  return (
    <TableRow className="cursor-pointer" onClick={onOpen}>
      <TableCell className="px-4">
        <Link
          href={adminMatchHref(match.id)}
          className="font-medium capitalize hover:underline"
        >
          {format(new Date(match.matchDate), "EEEE, dd/MM/yyyy", { locale: vi })}
        </Link>
        <div className="text-xs text-muted-foreground">
          {format(new Date(match.kickoffAt), "HH:mm")}
        </div>
      </TableCell>
      <TableCell className="max-w-40 truncate px-2 text-muted-foreground">
        {match.location || "—"}
      </TableCell>
      <TableCell className="px-2">
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap px-2 text-center">
        {players.length} người
        <div className="text-xs text-muted-foreground">{heads} suất</div>
      </TableCell>
      <TableCell className="px-2 text-center">{goals}</TableCell>
      <TableCell className="px-2 max-w-40 truncate">
        {mvps.length ? (
          <span className="inline-flex items-center gap-1">
            <Crown className="size-3.5 shrink-0 text-amber-500" />
            {mvps.map((p) => p.fullName).join(", ")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap px-2 text-right">
        {match.fieldCost != null ? (
          <>
            {formatVnd(match.fieldCost)}
            <div className="text-xs text-muted-foreground">
              {match.costPerHead != null
                ? `${formatVnd(match.costPerHead)}/suất`
                : "—"}
            </div>
          </>
        ) : (
          <Badge variant="outline">Chưa nhập</Badge>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap px-2 text-right">
        {formatVnd(paid)}
      </TableCell>
      <TableCell
        className={`whitespace-nowrap px-2 text-right ${due > 0 ? "font-semibold text-destructive" : "text-muted-foreground"}`}
      >
        {formatVnd(due)}
      </TableCell>
      <TableCell className="px-2">
        <ChevronRight className="size-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
};
