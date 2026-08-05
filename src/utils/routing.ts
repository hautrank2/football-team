// Central route registry. Prefer these helpers over hardcoding path strings so
// links stay consistent and are easy to refactor.

export const ROUTES = {
  home: "/",
  players: "/players", // full squad directory with filters
  lineups: "/lineups", // public browse (guests welcome)
  lineup: "/lineup", // my lineups (management, login required)
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

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
