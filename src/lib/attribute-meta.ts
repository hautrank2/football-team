// FE-owned grouping + labels for PlayerAttribute (FIFA-style ratings). The DB
// stores raw numbers; the UI decides how to group and label them.

import type { AttributeUpsertDto } from "@/types";

export type AttrKey = keyof AttributeUpsertDto;
export type AttrField = { key: AttrKey; label: string; max: number };
export type AttrGroup = { title: string; gk?: boolean; fields: AttrField[] };

const r = (key: AttrKey, label: string): AttrField => ({ key, label, max: 99 });

export const ATTRIBUTE_GROUPS: AttrGroup[] = [
  {
    title: "Tổng quan",
    fields: [
      { key: "overall", label: "Tổng thể (OVR)", max: 99 },
      { key: "skillMoves", label: "Kỹ năng (sao)", max: 5 },
    ],
  },
  {
    title: "Tốc độ",
    fields: [r("acceleration", "Tăng tốc"), r("sprintSpeed", "Chạy nước rút")],
  },
  {
    title: "Dứt điểm",
    fields: [
      r("attPositioning", "Chọn vị trí"),
      r("finishing", "Dứt điểm"),
      r("shotPower", "Lực sút"),
      r("longShots", "Sút xa"),
      r("volleys", "Vô lê"),
      r("penalties", "Phạt đền"),
    ],
  },
  {
    title: "Chuyền bóng",
    fields: [
      r("vision", "Nhãn quan"),
      r("crossing", "Tạt bóng"),
      r("freeKick", "Đá phạt"),
      r("shortPassing", "Chuyền ngắn"),
      r("longPassing", "Chuyền dài"),
      r("curve", "Xoáy"),
    ],
  },
  {
    title: "Rê bóng",
    fields: [
      r("agility", "Nhanh nhẹn"),
      r("balance", "Thăng bằng"),
      r("reactions", "Phản xạ"),
      r("ballControl", "Khống chế"),
      r("dribbling", "Rê bóng"),
      r("composure", "Điềm tĩnh"),
    ],
  },
  {
    title: "Phòng ngự",
    fields: [
      r("interceptions", "Cắt bóng"),
      r("heading", "Đánh đầu"),
      r("defAwareness", "Ý thức phòng ngự"),
      r("standingTackle", "Tắc bóng"),
      r("slidingTackle", "Xoạc bóng"),
    ],
  },
  {
    title: "Thể chất",
    fields: [
      r("jumping", "Bật nhảy"),
      r("stamina", "Thể lực"),
      r("strength", "Sức mạnh"),
      r("aggression", "Tranh chấp"),
    ],
  },
  {
    title: "Thủ môn",
    gk: true,
    fields: [
      r("gkDiving", "Bay người"),
      r("gkHandling", "Bắt bóng"),
      r("gkKicking", "Phát bóng"),
      r("gkReflexes", "Phản xạ"),
      r("gkPositioning", "Chọn vị trí"),
    ],
  },
];

// Flat list of every rating key (handy for building form defaults).
export const ATTR_KEYS: AttrKey[] = ATTRIBUTE_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
