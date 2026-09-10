import { CalendarDays, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon };

// The admin area's pages, in one place: the sidebar inside /admin and the
// "Quản trị" section of the header dropdown both render this list, so a new
// admin page shows up in both without anyone remembering to add it twice.
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/teams", label: "Teams", icon: Shield },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/matches", label: "Trận đấu", icon: CalendarDays },
];
