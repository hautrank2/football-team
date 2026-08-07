// Central route registry. Prefer these helpers over hardcoding path strings so
// links stay consistent and are easy to refactor.

export const ROUTES = {
  home: "/",
  players: "/players", // full squad directory with filters
  lineups: "/lineups", // public browse (guests welcome)
  lineup: "/lineup", // my lineups (management, login required)
  // Schedule / Match
  schedule: "/schedule", // vote lịch đá (login required)
  matches: "/matches", // các trận đấu (public)
  leaderboard: "/leaderboard", // vua phá lưới / kiến tạo (public)
  myMatches: "/my-matches", // trận đấu của tôi (login required)
  adminMatches: "/admin/matches", // quản lý trận (admin)
} as const;

// Detail path for a single match.
export const matchHref = (id: string): string => `/matches/${id}`;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// Build a "/login?redirect=<current path>" URL so the login flow can bounce the
// user back where they were. Safe to call from client effects/handlers only.
export const loginRedirectHref = (): string => {
  if (typeof window === "undefined") return "/login";
  const target = window.location.pathname + window.location.search;
  return target && target !== "/" && !target.startsWith("/login")
    ? `/login?redirect=${encodeURIComponent(target)}`
    : "/login";
};

// Only allow same-site relative redirects (guards against open-redirect abuse).
export const safeRedirect = (value: string | null | undefined): string | null =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : null;

// Append query params to a path, skipping empty values.
export const withQuery = (
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!params) return path;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
};
