// FE-owned labels for Player enums. The DB stores codes; the UI decides labels.
// Kept as plain data (no @prisma/client runtime import in client bundles).

export type Option<T extends string = string> = { value: T; label: string };

export const PLAYER_TITLE_OPTIONS: Option[] = [
  // Serious
  // { value: "FORWARD", label: "Tiền đạo" },
  // { value: "MIDFIELDER", label: "Tiền vệ" },
  // { value: "DEFENDER", label: "Hậu vệ" },
  // { value: "GOALKEEPER", label: "Thủ môn" },
  // { value: "WINGER", label: "Chiến thần đường biên" },
  // { value: "BOX_TO_BOX", label: "Bao sân" },
  // Fun
  { value: "MAESTRO", label: "Nhạc trưởng" },
  { value: "SNIPER", label: "Sát thủ vòng cấm" },
  { value: "THE_WALL", label: "Tường thành" },
  { value: "AERIAL_KING", label: "Vua không chiến" },
  { value: "SPEEDSTER", label: "Tốc độ bàn thờ" },
  { value: "ENGINE", label: "Máy chạy" },
  { value: "CARRY", label: "Gánh team" },
  { value: "FREE_KICK_MASTER", label: "Chuyên gia đá phạt" },
  { value: "BUTCHER", label: "Đồ tể" },
  { value: "GIANT", label: "Gã khổng lồ" },
  { value: "LUKAKU_SHOOTER", label: "Sút như Lukaku" },
  { value: "NEYMAR_DIVER", label: "Ăn vạ như Neymar" },
  { value: "REFLEX_KING", label: "Vua phản xạ" },
  { value: "BENCH_KING", label: "Vua dự bị" },
  { value: "SHIN_DESTROYER", label: "Kẻ hủy diệt ống đồng" },
  { value: "ALL_TALK", label: "Đá thì ít, nói thì nhiều" },
  { value: "GLASS_MAN", label: "Người thủy tinh" },
  { value: "OFFSIDE_KING", label: "Vua việt vị" },
  { value: "WOODEN_LEG", label: "Chân gỗ" },
  { value: "INVISIBLE_MAN", label: "Người tàng hình" },
  { value: "SECOND_REFEREE", label: "Trọng tài thứ hai" },
  { value: "LAST_MINUTE_HERO", label: "Người hùng phút bù giờ" },
  { value: "BACKPASS_SAINT", label: "Thánh chuyền về" },
  { value: "NO_LUNGS", label: "Cỗ máy không phổi" },
  { value: "TACKLE_KING", label: "Vua tắc bóng" },
  { value: "COLD_BLOODED", label: "Sát thủ máu lạnh" },
  { value: "ENTERTAINER", label: "Vua tấu hài" },
  { value: "PITCH_TERROR", label: "Hung thần sân phủi" },
  { value: "GOAL_POACHER", label: "Thợ săn bàn thắng" },
  { value: "XE_OM", label: "Xe ôm công nghệ" },
  { value: "MESSI_PHOTOCOPY", label: "Máy photo Messi" },
  { value: "CAPTAIN_FOREVER", label: "Đội trưởng vĩnh viễn" },
];

export const MARITAL_STATUS_OPTIONS: Option[] = [
  { value: "SINGLE", label: "Độc thân" },
  { value: "IN_RELATIONSHIP", label: "Đã có chủ" },
  { value: "MARRIED", label: "Đã kết hôn" },
  { value: "COMPLICATED", label: "Phức tạp" },
  { value: "CASUAL", label: "Mối quan hệ không ràng buộc" },
  { value: "AMBIGUOUS", label: "Mập mờ" },
];

// Gender — biological sex + orientation options in one list. Codes match the
// Gender enum.
export const GENDER_OPTIONS: Option[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "INTERSEX", label: "Liên giới tính (Intersex)" },
  { value: "HETEROSEXUAL", label: "Dị tính" },
  { value: "HOMOSEXUAL", label: "Đồng tính" },
  { value: "BISEXUAL", label: "Song tính" },
  { value: "PANSEXUAL", label: "Toàn tính" },
  { value: "ASEXUAL", label: "Vô tính" },
  { value: "QUESTIONING", label: "Đang tìm hiểu" },
  { value: "OTHER", label: "Khác" },
  { value: "UNSPECIFIED", label: "Không xác định" },
];

// Playing positions. Codes match the PlayerPosition enum.
export const PLAYER_POSITION_OPTIONS: Option[] = [
  { value: "GOALKEEPER", label: "Thủ môn" },
  { value: "SWEEPER", label: "Trung vệ thòng" },
  { value: "CENTER_BACK", label: "Trung vệ" },
  { value: "DEFENDER", label: "Hậu vệ" },
  { value: "WING_BACK", label: "Hậu vệ cánh" },
  { value: "DEF_MID", label: "Tiền vệ phòng ngự" },
  { value: "CENTER_MID", label: "Tiền vệ trung tâm" },
  { value: "MIDFIELDER", label: "Tiền vệ" },
  { value: "ATT_MID", label: "Tiền vệ tấn công" },
  { value: "WINGER", label: "Tiền đạo cánh" },
  { value: "SECOND_STRIKER", label: "Tiền đạo hộ công" },
  { value: "STRIKER", label: "Trung phong" },
  { value: "FORWARD", label: "Tiền đạo" },
];

// Social platforms. Codes match the SocialType enum.
export const SOCIAL_TYPE_OPTIONS: Option[] = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "OTHER", label: "Khác" },
];

const socialTypeMap = new Map(SOCIAL_TYPE_OPTIONS.map((o) => [o.value, o.label]));
export const socialTypeLabel = (code?: string | null): string =>
  (code && socialTypeMap.get(code)) || code || "";

const titleMap = new Map(PLAYER_TITLE_OPTIONS.map((o) => [o.value, o.label]));
export const playerTitleLabel = (code?: string | null): string =>
  (code && titleMap.get(code)) || code || "";

const maritalMap = new Map(MARITAL_STATUS_OPTIONS.map((o) => [o.value, o.label]));
export const maritalStatusLabel = (code?: string | null): string =>
  (code && maritalMap.get(code)) || "";

const positionMap = new Map(PLAYER_POSITION_OPTIONS.map((o) => [o.value, o.label]));
export const playerPositionLabel = (code?: string | null): string =>
  (code && positionMap.get(code)) || code || "";

// ── Position categories (the 4 tactical lines) ───────────────────────────────
// Each specific position rolls up into one of GK / DF / MD / FW (the two fun
// positions — SUPER_SUB, UTILITY — belong to no line).
export type PositionCategory = "GK" | "DF" | "MD" | "FW";

export const POSITION_CATEGORY_META: Record<
  PositionCategory,
  { label: string; short: string; badge: string; dot: string }
> = {
  GK: {
    label: "Thủ môn",
    short: "GK",
    badge: "border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  DF: {
    label: "Hậu vệ",
    short: "DF",
    badge: "border-transparent bg-blue-500/20 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  MD: {
    label: "Tiền vệ",
    short: "MD",
    badge: "border-transparent bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  FW: {
    label: "Tiền đạo",
    short: "FW",
    badge: "border-transparent bg-red-500/20 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    dot: "bg-red-500",
  },
};

// Which line a specific position belongs to (fun positions → null).
const POSITION_TO_CATEGORY: Record<string, PositionCategory> = {
  GOALKEEPER: "GK",
  SWEEPER: "DF",
  CENTER_BACK: "DF",
  DEFENDER: "DF",
  WING_BACK: "DF",
  DEF_MID: "MD",
  CENTER_MID: "MD",
  MIDFIELDER: "MD",
  ATT_MID: "MD",
  WINGER: "FW",
  SECOND_STRIKER: "FW",
  STRIKER: "FW",
  FORWARD: "FW",
  // SUPER_SUB, UTILITY → no line
};

export const positionCategory = (code?: string | null): PositionCategory | null =>
  (code && POSITION_TO_CATEGORY[code]) || null;

// Tailwind classes for a single position badge, coloured by its line. Neutral for
// the fun positions that don't map to a line.
export const positionBadgeClass = (code?: string | null): string => {
  const cat = positionCategory(code);
  return cat
    ? POSITION_CATEGORY_META[cat].badge
    : "border-transparent bg-muted text-muted-foreground";
};

// The player's main line = the category with the most positions. Ties are broken
// by line order GK > DF > MD > FW. Returns null when no position maps to a line.
export const dominantCategory = (positions?: string[] | null): PositionCategory | null => {
  if (!positions?.length) return null;
  const counts: Record<PositionCategory, number> = { GK: 0, DF: 0, MD: 0, FW: 0 };
  for (const p of positions) {
    const cat = positionCategory(p);
    if (cat) counts[cat] += 1;
  }
  let best: PositionCategory | null = null;
  let bestCount = 0;
  for (const cat of ["GK", "DF", "MD", "FW"] as PositionCategory[]) {
    if (counts[cat] > bestCount) {
      best = cat;
      bestCount = counts[cat];
    }
  }
  return best;
};

const genderMap = new Map(GENDER_OPTIONS.map((o) => [o.value, o.label]));
export const genderLabel = (code?: string | null): string =>
  (code && genderMap.get(code)) || "";
