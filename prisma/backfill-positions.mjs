import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Backfill `positions` for players that have NONE.
//
// Every player should carry at least one position (so the cards get a tactical
// line colour + tooltip). Players who already have positions are left untouched.
// Positions are derived from the player's `title` archetype, mirroring the logic
// in backfill-attributes.mjs so a "Tiền đạo" gets forward roles, etc.
//
// DRY RUN by default — prints what WOULD change. Set APPLY=1 to write.
// ─────────────────────────────────────────────────────────────────────────────

const APPLY = process.env.APPLY === "1";

// Titles that mean "goalkeeper".
const KEEPER_TITLES = new Set(["GOALKEEPER", "REFLEX_KING"]);

// Map every title onto one of the base archetypes (same as the attribute script).
const TITLE_TO_ARCHETYPE = {
  FORWARD: "FORWARD", SNIPER: "FORWARD", LUKAKU_SHOOTER: "FORWARD", CARRY: "FORWARD", OFFSIDE_KING: "FORWARD",
  WINGER: "WINGER", SPEEDSTER: "WINGER", NEYMAR_DIVER: "WINGER",
  MIDFIELDER: "MIDFIELDER", MAESTRO: "MIDFIELDER", FREE_KICK_MASTER: "MIDFIELDER",
  BOX_TO_BOX: "BOX_TO_BOX", ENGINE: "BOX_TO_BOX",
  DEFENDER: "DEFENDER", THE_WALL: "DEFENDER", AERIAL_KING: "DEFENDER", GIANT: "DEFENDER",
  BUTCHER: "DEFENDER", SHIN_DESTROYER: "DEFENDER",
};

// Archetype → positions (valid PlayerPosition enum codes). Two-ish roles each so
// the line reads clearly and the tooltip has something extra to show.
const ARCHETYPE_POSITIONS = {
  FORWARD: ["STRIKER", "FORWARD"],
  WINGER: ["WINGER", "SECOND_STRIKER"],
  MIDFIELDER: ["CENTER_MID", "ATT_MID"],
  BOX_TO_BOX: ["DEF_MID", "CENTER_MID"],
  DEFENDER: ["CENTER_BACK", "WING_BACK"],
  BALANCED: ["CENTER_MID"], // unmapped "fun" titles → a neutral midfield role
};

function positionsFor(title) {
  if (KEEPER_TITLES.has(title)) return ["GOALKEEPER"];
  return ARCHETYPE_POSITIONS[TITLE_TO_ARCHETYPE[title] ?? "BALANCED"];
}

async function main() {
  // Fetch everyone; decide in JS so docs missing the field entirely are covered
  // too (Mongo negation/isEmpty filters can skip docs that lack the field).
  const players = await prisma.player.findMany({
    select: { id: true, username: true, title: true, positions: true, role: true },
  });

  const needing = players.filter((p) => !p.positions || p.positions.length === 0);
  const skipped = players.length - needing.length;

  console.log(
    `${players.length} player(s) total — ${needing.length} without positions, ${skipped} already set (skipped).\n`
  );
  if (!needing.length) {
    console.log("Nothing to backfill.");
    return;
  }

  console.log(`${APPLY ? "APPLYING" : "DRY RUN — no writes"}:\n`);
  for (const p of needing) {
    const positions = positionsFor(p.title);
    console.log(
      `  ${p.username.padEnd(16)} ${String(p.role).padEnd(6)} ${p.title.padEnd(18)} → [${positions.join(", ")}]`
    );
    if (APPLY) {
      await prisma.player.update({ where: { id: p.id }, data: { positions } });
    }
  }

  console.log(`\n${APPLY ? `Done — updated ${needing.length} player(s).` : "Dry run complete. Re-run with APPLY=1 to write."}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
