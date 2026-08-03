// Keys for localStorage / sessionStorage / cookies. Always define them here,
// never inline at the call site, and prefix every key with the project name in
// UPPER_CASE so entries are unambiguous in devtools and never collide.
const PREFIX = "FOOTBALL";

export const STORAGE_KEYS = {
  AUTH_USER: `${PREFIX}_AUTH_USER`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
