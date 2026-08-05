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
];

const titleMap = new Map(PLAYER_TITLE_OPTIONS.map((o) => [o.value, o.label]));
export const playerTitleLabel = (code?: string | null): string =>
  (code && titleMap.get(code)) || code || "";

const maritalMap = new Map(MARITAL_STATUS_OPTIONS.map((o) => [o.value, o.label]));
export const maritalStatusLabel = (code?: string | null): string =>
  (code && maritalMap.get(code)) || "";
