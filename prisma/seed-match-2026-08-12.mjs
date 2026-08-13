import { PrismaClient, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// One-off: add the match on 12/08/2026 and a vote (+ participant entry) for every
// real player. Mirrors the app's POST /api/match logic (see api/match/route.ts):
//   • matchDate  = VN calendar day anchored at UTC midnight → 2026-08-12T00:00Z
//   • kickoffAt  = 19:00 VN = 12:00 UTC of that day
//   • each vote (guestCount 0) is tagged with the match, and mirrored into
//     MatchPlayer (the "danh sách tham gia").
//
// "Members" = real players only: role PLAYER, not test, not deleted (per the
// user's choice — admin + test1/test2 excluded).
//
// DRY RUN by default — prints what WOULD change. Set APPLY=1 to write.
// ─────────────────────────────────────────────────────────────────────────────

const APPLY = process.env.APPLY === "1";

// 12/08/2026, day-anchored at UTC midnight (the app's "floating date").
const matchDate = new Date("2026-08-12T00:00:00.000Z");
// 19:00 VN (UTC+7) == 12:00 UTC of the same day.
const kickoffAt = new Date("2026-08-12T12:00:00.000Z");

async function main() {
  // Guard: one match per day.
  const dayEnd = new Date(matchDate.getTime() + 24 * 60 * 60 * 1000 - 1);
  const existing = await prisma.match.findFirst({
    where: { matchDate: { gte: matchDate, lte: dayEnd } },
    select: { id: true },
  });
  if (existing) {
    console.log(`A match already exists on 12/08 (id ${existing.id}). Aborting — nothing changed.`);
    return;
  }

  // Real players only. Filter in JS so docs missing isTest/isDeleted are handled
  // (Mongo negation filters can skip docs that lack the field).
  const all = await prisma.player.findMany({
    select: { id: true, username: true, role: true, isTest: true, isDeleted: true },
  });
  const members = all.filter(
    (p) => p.role === "PLAYER" && p.isTest !== true && p.isDeleted !== true
  );

  console.log(
    `Match 12/08/2026 — kickoff 19:00 VN.\n` +
      `${members.length} real player(s) will get a vote + participant entry ` +
      `(of ${all.length} accounts total).\n`
  );
  members.forEach((m) => console.log(`  ${m.username}`));

  if (!APPLY) {
    console.log("\nDRY RUN — no writes. Re-run with APPLY=1 to write.");
    return;
  }

  // 1) Create the match.
  const match = await prisma.match.create({
    data: { matchDate, kickoffAt, status: MatchStatus.SCHEDULED },
  });

  // 2) A vote per member for that day, tagged with the match (idempotent upsert).
  for (const m of members) {
    await prisma.matchVote.upsert({
      where: { playerId_voteDate: { playerId: m.id, voteDate: matchDate } },
      create: { playerId: m.id, voteDate: matchDate, guestCount: 0, matchId: match.id },
      update: { matchId: match.id },
    });
  }

  // 3) Mirror into the participant list (idempotent upsert).
  for (const m of members) {
    await prisma.matchPlayer.upsert({
      where: { matchId_playerId: { matchId: match.id, playerId: m.id } },
      create: { matchId: match.id, playerId: m.id, guestCount: 0 },
      update: { guestCount: 0 },
    });
  }

  console.log(`\nDone — created match ${match.id} with ${members.length} participants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
