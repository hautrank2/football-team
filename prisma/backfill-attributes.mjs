import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Complex attribute generator.
//
// Goal: give every player a realistic, VARIED FIFA-style stat set whose overall
// rating lands in [80, 90]. Instead of flat 50s, each player gets a profile
// driven by their `title` (an archetype), with strong / weak stat groups,
// per-stat noise, and a few signature boosts. The whole set is then shifted so
// the mean (the OVR) sits in the target band.
// ─────────────────────────────────────────────────────────────────────────────

// Stat keys grouped the same way the UI groups them (see lib/attribute-meta.ts).
const GROUPS = {
  PACE: ["acceleration", "sprintSpeed"],
  SHOOTING: ["attPositioning", "finishing", "shotPower", "longShots", "volleys", "penalties"],
  PASSING: ["vision", "crossing", "freeKick", "shortPassing", "longPassing", "curve"],
  DRIBBLING: ["agility", "balance", "reactions", "ballControl", "dribbling", "composure"],
  DEFENDING: ["interceptions", "heading", "defAwareness", "standingTackle", "slidingTackle"],
  PHYSICAL: ["jumping", "stamina", "strength", "aggression"],
};
const OUTFIELD_KEYS = Object.values(GROUPS).flat();
const GK_KEYS = ["gkDiving", "gkHandling", "gkKicking", "gkReflexes", "gkPositioning"];

// Group tier → offset from the ~85 baseline. S = signature strength … VW = very weak.
const TIER = { S: 9, A: 5, M: 0, W: -9, VW: -15 };

// Base outfield archetypes: which groups are strong / weak.
const ARCHETYPES = {
  FORWARD:    { PACE: "A", SHOOTING: "S", PASSING: "M", DRIBBLING: "A", DEFENDING: "VW", PHYSICAL: "M", skill: [4, 5] },
  WINGER:     { PACE: "S", SHOOTING: "A", PASSING: "M", DRIBBLING: "S", DEFENDING: "W",  PHYSICAL: "W", skill: [4, 5] },
  MIDFIELDER: { PACE: "M", SHOOTING: "M", PASSING: "S", DRIBBLING: "A", DEFENDING: "M",  PHYSICAL: "A", skill: [3, 4] },
  BOX_TO_BOX: { PACE: "A", SHOOTING: "M", PASSING: "A", DRIBBLING: "M", DEFENDING: "A",  PHYSICAL: "S", skill: [3, 4] },
  DEFENDER:   { PACE: "M", SHOOTING: "W", PASSING: "M", DRIBBLING: "W", DEFENDING: "S",  PHYSICAL: "S", skill: [2, 3] },
  BALANCED:   { PACE: "M", SHOOTING: "M", PASSING: "M", DRIBBLING: "M", DEFENDING: "M",  PHYSICAL: "M", skill: [3, 4] },
};

// Signature per-stat boosts keyed by title (adds flavour / complexity).
const SIGNATURE = {
  SNIPER: { finishing: 10, longShots: 8, attPositioning: 6 },
  LUKAKU_SHOOTER: { shotPower: 12, finishing: 8, strength: 8 },
  FREE_KICK_MASTER: { freeKick: 14, curve: 10, longShots: 6 },
  AERIAL_KING: { heading: 14, jumping: 12, strength: 6 },
  GIANT: { strength: 12, heading: 10, jumping: 8 },
  SPEEDSTER: { acceleration: 12, sprintSpeed: 12 },
  NEYMAR_DIVER: { dribbling: 12, agility: 10, balance: 8 },
  MAESTRO: { vision: 12, shortPassing: 10, composure: 8 },
  ENGINE: { stamina: 14, aggression: 6 },
  SHIN_DESTROYER: { standingTackle: 12, slidingTackle: 12, aggression: 8 },
  THE_WALL: { standingTackle: 10, defAwareness: 12, strength: 8 },
  BUTCHER: { slidingTackle: 12, aggression: 12, strength: 6 },
  CARRY: { dribbling: 10, finishing: 8, composure: 8 },
};

// Titles that mean "goalkeeper".
const KEEPER_TITLES = new Set(["GOALKEEPER", "REFLEX_KING"]);

// Map every title onto one of the base archetypes.
const TITLE_TO_ARCHETYPE = {
  FORWARD: "FORWARD", SNIPER: "FORWARD", LUKAKU_SHOOTER: "FORWARD", CARRY: "FORWARD", OFFSIDE_KING: "FORWARD",
  WINGER: "WINGER", SPEEDSTER: "WINGER", NEYMAR_DIVER: "WINGER",
  MIDFIELDER: "MIDFIELDER", MAESTRO: "MIDFIELDER", FREE_KICK_MASTER: "MIDFIELDER",
  BOX_TO_BOX: "BOX_TO_BOX", ENGINE: "BOX_TO_BOX",
  DEFENDER: "DEFENDER", THE_WALL: "DEFENDER", AERIAL_KING: "DEFENDER", GIANT: "DEFENDER",
  BUTCHER: "DEFENDER", SHIN_DESTROYER: "DEFENDER",
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const noise = () => randInt(-5, 5); // per-stat jitter

// Build the full attribute payload for a player.
function generateAttribute(title) {
  const targetOvr = randInt(80, 90); // this player's target overall

  if (KEEPER_TITLES.has(title)) return generateKeeper(targetOvr);

  const arch = ARCHETYPES[TITLE_TO_ARCHETYPE[title] ?? "BALANCED"];
  const sig = SIGNATURE[title] ?? {};

  // 1) Raw values from archetype tiers + noise + signature.
  const raw = {};
  for (const [group, keys] of Object.entries(GROUPS)) {
    const offset = TIER[arch[group]];
    for (const key of keys) {
      raw[key] = 85 + offset + noise() + (sig[key] ?? 0);
    }
  }

  // 2) Shift the whole set so its mean equals the target OVR, then clamp.
  const mean = OUTFIELD_KEYS.reduce((a, k) => a + raw[k], 0) / OUTFIELD_KEYS.length;
  const shift = targetOvr - mean;
  const out = {};
  for (const key of OUTFIELD_KEYS) out[key] = clamp(Math.round(raw[key] + shift), 42, 99);

  // 3) OVR = mean of the (clamped) outfield stats, kept inside the band.
  const finalMean = OUTFIELD_KEYS.reduce((a, k) => a + out[k], 0) / OUTFIELD_KEYS.length;
  out.overall = clamp(Math.round(finalMean), 80, 90);
  out.skillMoves = randInt(arch.skill[0], arch.skill[1]);

  return out; // GK fields left undefined (null) for outfielders
}

// Keepers: OVR is driven by the GK stats; outfield fields kept modest but present.
function generateKeeper(targetOvr) {
  const out = {};

  // Modest outfield block (required Int fields must exist).
  for (const key of OUTFIELD_KEYS) out[key] = clamp(55 + noise(), 42, 75);

  // Strong, varied GK block, shifted to the target mean.
  const raw = {};
  for (const key of GK_KEYS) raw[key] = 85 + noise();
  const mean = GK_KEYS.reduce((a, k) => a + raw[k], 0) / GK_KEYS.length;
  const shift = targetOvr - mean;
  for (const key of GK_KEYS) out[key] = clamp(Math.round(raw[key] + shift), 60, 99);

  const gkMean = GK_KEYS.reduce((a, k) => a + out[k], 0) / GK_KEYS.length;
  out.overall = clamp(Math.round(gkMean), 80, 90);
  out.reactions = clamp(out.reactions + 12, 42, 99); // keepers need reactions
  out.skillMoves = 1;

  return out;
}

async function main() {
  const players = await prisma.player.findMany({
    select: { id: true, username: true, title: true },
  });

  console.log(`Regenerating attributes for ${players.length} player(s)…\n`);

  for (const p of players) {
    const data = generateAttribute(p.title);
    await prisma.playerAttribute.upsert({
      where: { playerId: p.id },
      create: { playerId: p.id, ...data },
      update: data,
    });
    console.log(`  ${String(p.overall ?? "").padEnd(0)}${p.username.padEnd(16)} ${p.title.padEnd(18)} OVR ${data.overall}`);
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
