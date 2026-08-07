"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarCheck, Goal, Handshake, LogIn, Wallet } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts";
import { formatVnd } from "@/lib/format";
import { useMyMatches } from "@/hooks/schedule";
import { matchHref } from "@/utils/routing";

const MyMatchesPage = () => {
  const { user, isReady } = useAuth();
  const { data, isLoading } = useMyMatches(user?.id);

  if (isReady && !user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <CalendarCheck className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Trận đấu của tôi</h1>
        <Button asChild>
          <Link href="/login">
            <LogIn className="size-4" />
            Đăng nhập
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-semibold">Trận đấu của tôi</h1>

      {isLoading || !data ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatTile icon={<Wallet className="size-4" />} label="Đang nợ" value={formatVnd(data.totalDebt)} highlight={data.totalDebt > 0} />
            <StatTile icon={<Goal className="size-4" />} label="Bàn thắng" value={String(data.totalGoals)} />
            <StatTile icon={<Handshake className="size-4" />} label="Kiến tạo" value={String(data.totalAssists)} />
          </div>

          {data.matches.length === 0 ? (
            <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
              Bạn chưa tham gia trận nào.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.matches.map((row) => (
                <Link key={row.match.id} href={matchHref(row.match.id)} className="group">
                  <Card className="transition-colors group-hover:border-primary/50">
                    <CardContent className="flex items-center gap-4 py-3">
                      <div className="flex-1">
                        <div className="font-medium capitalize">
                          {format(new Date(row.match.matchDate), "EEEE, dd/MM/yyyy", { locale: vi })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.goals} bàn · {row.assists} kiến tạo
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {row.amountDue ? formatVnd(row.amountDue) : "—"}
                        </div>
                        {row.amountDue ? (
                          <Badge variant={row.isPaid ? "default" : "outline"} className="mt-0.5">
                            {row.isPaid ? "Đã trả" : "Chưa trả"}
                          </Badge>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyMatchesPage;

const StatTile = ({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <Card>
    <CardContent className="flex flex-col gap-1 py-4">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={highlight ? "text-lg font-bold text-destructive" : "text-lg font-bold"}>{value}</span>
    </CardContent>
  </Card>
);
