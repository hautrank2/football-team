// Pure domain helpers for the Schedule / Match feature. No Prisma / IO here —
// routes call these so the money split and MVP tally live in one place.

// Total "suất" (heads) on a participant list: each player + their guests.
export const totalHeadsOf = (players: { guestCount: number }[]): number =>
  players.reduce((sum, p) => sum + 1 + p.guestCount, 0);

// Per-head cost, ROUNDED UP (ceil) — tổng thu ≥ tiền sân, không thiếu.
export const costPerHeadOf = (fieldCost: number, totalHeads: number): number =>
  totalHeads > 0 ? Math.ceil(fieldCost / totalHeads) : 0;

// What one participant owes: covers themselves + their guests.
export const amountDueOf = (costPerHead: number, guestCount: number): number =>
  costPerHead * (1 + guestCount);

// Tally MVP ballots → the winning player id(s). Highest vote count wins; ties
// return everyone tied; requires at least one vote (empty otherwise).
export const tallyMvp = (votes: { mvpPlayerId: string }[]): string[] => {
  const counts = new Map<string, number>();
  for (const v of votes) counts.set(v.mvpPlayerId, (counts.get(v.mvpPlayerId) ?? 0) + 1);

  let max = 0;
  for (const c of counts.values()) if (c > max) max = c;
  if (max <= 0) return [];

  return [...counts.entries()].filter(([, c]) => c === max).map(([id]) => id);
};

// Strip the password hash from a player record before it leaves the API.
export const sanitizePlayer = <T extends { passwordHash?: string }>(
  player: T
): Omit<T, "passwordHash"> => {
  const rest = { ...player };
  delete (rest as { passwordHash?: string }).passwordHash;
  return rest;
};
