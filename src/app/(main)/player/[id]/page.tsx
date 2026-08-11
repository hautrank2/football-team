"use client";

import {
  ArrowLeft,
  AtSign,
  Cake,
  Footprints,
  Globe,
  Heart,
  Pencil,
  Phone,
  Ruler,
  ShieldHalf,
  UserRound,
  Weight,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { PlayerPortrait } from "@/components/player/player-portrait";
import { cardAccent } from "@/lib/player-card-theme";
import {
  genderLabel,
  maritalStatusLabel,
  playerPositionLabel,
  playerTitleLabel,
  positionBadgeClass,
  socialTypeLabel,
} from "@/lib/player-meta";
import { cn } from "@/lib/utils";
import type { PlayerAttributeModel, PlayerModel } from "@/types";
import { socialIcon } from "@/components/player/social-links";
import { QuotesSection } from "./_components/QuotesSection";
import { usePlayerDetailPage } from "./hook";

const HERO_IMAGE = "/images/football_wallpaper.jpg";

const PlayerDetailPage = () => {
  const s = usePlayerDetailPage();

  if (s.isLoading) return <LoadingState />;
  if (s.isError || !s.player) return <NotFoundState />;

  const player = s.player;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-4 gap-2" asChild>
        <Link href="/">
          <ArrowLeft className="size-4" />
          Về trang chủ
        </Link>
      </Button>

      <PlayerHeader player={player} canEdit={s.canEdit} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <InfoCard player={player} />
          {player.positions?.length ? <PositionsCard player={player} /> : null}
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          {player.attribute ? (
            <AttributesCard attribute={player.attribute} />
          ) : (
            <EmptyCard text="Cầu thủ này chưa có chỉ số." />
          )}
          <QuotesSection subjectId={player.id} />
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailPage;

// ── Header ──────────────────────────────────────────────────

const PlayerHeader = ({ player, canEdit }: { player: PlayerModel; canEdit?: boolean }) => {
  const accent = cardAccent(player.positions);
  const ovr = player.attribute?.overall;
  const hasCutout = !!player.avatarNoBg;

  return (
    <div className="relative rounded-2xl border bg-card">
      {/* Banner */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl sm:h-52">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGE} alt="" className="size-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-card/10" />
        {/* Position-tinted wash */}
        <div className={cn("absolute inset-0 bg-gradient-to-tr", accent.stage)} />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-8">
        {/* The cutout stands tall and breaks out above the banner; a plain photo
            gets a smaller framed card instead. */}
        <div
          className={cn(
            "relative mx-auto shrink-0 sm:mx-0",
            hasCutout
              ? "-mt-32 aspect-[3/4] w-48 sm:-mt-40 sm:w-56"
              : "-mt-24 aspect-square w-36 sm:-mt-28 sm:w-44",
          )}
        >
          <div
            className={cn(
              "absolute inset-x-6 top-6 h-40 rounded-full blur-3xl",
              accent.halo,
            )}
          />
          <PlayerPortrait
            player={player}
            preview
            className="absolute inset-0"
            imgClassName={
              hasCutout
                ? "drop-shadow-[0_18px_30px_rgba(0,0,0,0.4)]"
                : "rounded-2xl border-4 border-card shadow-lg"
            }
            fallbackClassName="rounded-2xl border-4 border-card text-6xl"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2 text-center sm:pb-2 sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Typography variant="h1" className="text-3xl uppercase sm:text-4xl">
              {player.fullName}
            </Typography>
            {player.jerseyNumber != null ? (
              <span className={cn("text-2xl font-black", accent.text)}>
                #{player.jerseyNumber}
              </span>
            ) : null}
          </div>
          {player.nickname ? (
            <div className={cn("font-medium", accent.text)}>{`"${player.nickname}"`}</div>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge variant="secondary">{playerTitleLabel(player.title)}</Badge>
            {player.team?.name ? (
              <Badge variant="outline" className="gap-1">
                <ShieldHalf className="size-3.5" />
                {player.team.name}
              </Badge>
            ) : null}
          </div>
          {player.bio ? (
            <p className="mx-auto mt-1 max-w-2xl text-sm text-foreground/80 sm:mx-0">{player.bio}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-3 sm:flex-col sm:items-end sm:pb-2">
          {ovr ? (
            <div className="flex flex-col items-center rounded-xl bg-primary px-4 py-2 text-primary-foreground shadow-md">
              <span className="text-3xl font-black leading-none">{ovr}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide">Overall</span>
            </div>
          ) : null}
          {canEdit ? (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href={`/admin/players/${player.id}`}>
                <Pencil className="size-3.5" />
                Cập nhật
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ── Info card ───────────────────────────────────────────────

const EMPTY = "—"; // shown when a field has no data

// Full info card — every field is always shown; missing data reads as "—".
const InfoCard = ({ player }: { player: PlayerModel }) => {
  const age = calcAge(player.birthday);
  const marital = maritalStatusLabel(player.maritalStatus);
  const gender = genderLabel(player.gender);
  const [left, right] = player.foot ?? [];
  const hasFoot = left != null || right != null;

  return (
    <Card title="Thông tin">
      <div className="flex flex-col divide-y divide-border">
        <InfoRow icon={AtSign} label="Biệt danh">
          {player.nickname || EMPTY}
        </InfoRow>
        <InfoRow icon={Cake} label="Ngày sinh">
          {player.birthday ? (
            <>
              {formatDate(player.birthday)}
              {age != null ? <span className="text-muted-foreground"> · {age} tuổi</span> : null}
            </>
          ) : (
            EMPTY
          )}
        </InfoRow>
        <InfoRow icon={UserRound} label="Giới tính">
          {gender || EMPTY}
        </InfoRow>
        <InfoRow icon={Heart} label="Hôn nhân">
          {marital || EMPTY}
        </InfoRow>
        <InfoRow icon={Ruler} label="Chiều cao">
          {player.height ? `${player.height} cm` : EMPTY}
        </InfoRow>
        <InfoRow icon={Weight} label="Cân nặng">
          {player.weight ? `${player.weight} kg` : EMPTY}
        </InfoRow>
        <InfoRow icon={Footprints} label="Chân thuận">
          {hasFoot ? `Trái ${left ?? "–"}/5 · Phải ${right ?? "–"}/5` : EMPTY}
        </InfoRow>
        <InfoRow icon={Phone} label="Điện thoại">
          {player.phone ? (
            <a href={`tel:${player.phone}`} className="hover:underline">
              {player.phone}
            </a>
          ) : (
            EMPTY
          )}
        </InfoRow>
        <div className="flex items-center gap-3 py-2.5 last:pb-0">
          <Globe className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Mạng xã hội</span>
          <div className="ml-auto flex flex-wrap justify-end gap-2">
            {player.socials?.length ? (
              player.socials.map((s, i) => {
                const Icon = socialIcon(s.type);
                return (
                  <a
                    key={i}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={socialTypeLabel(s.type)}
                    className="flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })
            ) : (
              <span className="text-sm font-medium">{EMPTY}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
    <Icon className="size-4 shrink-0 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="ml-auto text-sm font-medium">{children}</span>
  </div>
);

// ── Positions ───────────────────────────────────────────────

const PositionsCard = ({ player }: { player: PlayerModel }) => (
  <Card title="Vị trí">
    <div className="flex flex-wrap gap-2">
      {player.positions?.map((p) => (
        <Badge key={p} variant="outline" className={cn("font-normal", positionBadgeClass(p))}>
          {playerPositionLabel(p)}
        </Badge>
      ))}
    </div>
  </Card>
);

// ── Attributes ──────────────────────────────────────────────

const ATTRIBUTE_GROUPS: {
  title: string;
  keys: [keyof PlayerAttributeModel, string][];
}[] = [
  {
    title: "Tốc độ",
    keys: [
      ["acceleration", "Tăng tốc"],
      ["sprintSpeed", "Chạy nước rút"],
    ],
  },
  {
    title: "Dứt điểm",
    keys: [
      ["attPositioning", "Chọn vị trí"],
      ["finishing", "Dứt điểm"],
      ["shotPower", "Lực sút"],
      ["longShots", "Sút xa"],
      ["volleys", "Vô-lê"],
      ["penalties", "Phạt đền"],
    ],
  },
  {
    title: "Chuyền bóng",
    keys: [
      ["vision", "Nhãn quan"],
      ["crossing", "Tạt bóng"],
      ["freeKick", "Đá phạt"],
      ["shortPassing", "Chuyền ngắn"],
      ["longPassing", "Chuyền dài"],
      ["curve", "Xoáy bóng"],
    ],
  },
  {
    title: "Rê bóng",
    keys: [
      ["agility", "Nhanh nhẹn"],
      ["balance", "Thăng bằng"],
      ["reactions", "Phản xạ"],
      ["ballControl", "Khống chế"],
      ["dribbling", "Rê bóng"],
      ["composure", "Điềm tĩnh"],
    ],
  },
  {
    title: "Phòng ngự",
    keys: [
      ["interceptions", "Cắt bóng"],
      ["heading", "Đánh đầu"],
      ["defAwareness", "Nhận thức PN"],
      ["standingTackle", "Tắc bóng"],
      ["slidingTackle", "Xoạc bóng"],
    ],
  },
  {
    title: "Thể lực",
    keys: [
      ["jumping", "Bật nhảy"],
      ["stamina", "Thể lực"],
      ["strength", "Sức mạnh"],
      ["aggression", "Quyết liệt"],
    ],
  },
  {
    title: "Thủ môn",
    keys: [
      ["gkDiving", "Đổ người"],
      ["gkHandling", "Bắt bóng"],
      ["gkKicking", "Phát bóng"],
      ["gkReflexes", "Phản xạ"],
      ["gkPositioning", "Chọn vị trí"],
    ],
  },
];

const AttributesCard = ({ attribute }: { attribute: PlayerAttributeModel }) => {
  const groups = ATTRIBUTE_GROUPS.map((g) => ({
    ...g,
    rows: g.keys
      .map(([key, label]) => [label, attribute[key]] as const)
      .filter((r): r is readonly [string, number] => typeof r[1] === "number"),
  })).filter((g) => g.rows.length > 0);

  return (
    <Card title="Chỉ số">
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </div>
            {group.rows.map(([label, value]) => (
              <StatBar key={label} label={label} value={value} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

const StatBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2">
    <span className="w-24 shrink-0 truncate text-sm text-foreground/80">{label}</span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${statColor(value)}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
    <span className="w-7 shrink-0 text-right text-sm font-semibold tabular-nums">{value}</span>
  </div>
);

// ── Shared bits ─────────────────────────────────────────────

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border bg-card p-5">
    <h2 className="mb-4 text-lg font-semibold uppercase tracking-tight">{title}</h2>
    {children}
  </section>
);

const EmptyCard = ({ text }: { text: string }) => (
  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
    {text}
  </div>
);

const LoadingState = () => (
  <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
    <Skeleton className="h-64 w-full rounded-2xl" />
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-48 w-full rounded-xl lg:col-span-1" />
      <Skeleton className="h-96 w-full rounded-xl lg:col-span-2" />
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-24 text-center">
    <Typography variant="h3">Không tìm thấy cầu thủ</Typography>
    <Typography className="text-muted-foreground">
      Cầu thủ này không tồn tại hoặc đã bị xóa.
    </Typography>
    <Button variant="outline" asChild>
      <Link href="/">
        <ArrowLeft className="size-4" />
        Về trang chủ
      </Link>
    </Button>
  </div>
);

// ── Helpers ─────────────────────────────────────────────────

const statColor = (value: number): string => {
  if (value >= 80) return "bg-emerald-500";
  if (value >= 65) return "bg-lime-500";
  if (value >= 50) return "bg-yellow-500";
  if (value >= 35) return "bg-orange-500";
  return "bg-red-500";
};

const formatDate = (value: string | Date): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const calcAge = (value: string | Date): number | null => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};
