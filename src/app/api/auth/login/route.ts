import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiError, route } from "@/server/http";
import { ok } from "@/server/response";
import { parseBody } from "@/server/validation";
import { authLogin } from "@/server/schemas";

// POST /api/auth/login — verify credentials, return the player (no session yet).
export const POST = route(async (req) => {
  const { username, password } = await parseBody(req, authLogin);

  const player = await prisma.player.findUnique({ where: { username } });
  const valid = player && (await bcrypt.compare(password, player.passwordHash));
  if (!valid) throw new ApiError(401, "Invalid username or password");

  const { passwordHash, ...safe } = player;
  void passwordHash;
  return ok(safe);
});
