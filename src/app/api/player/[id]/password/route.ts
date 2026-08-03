import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiError, notFound, route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { changePassword } from "@/types";

type Params = { id: string };

// PATCH /api/player/:id/password — change a player's own password. The current
// password must be supplied and is verified before the new one is stored.
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { currentPassword, newPassword } = await parseBody(req, changePassword);

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) throw notFound("Player");

  const valid = await bcrypt.compare(currentPassword, player.passwordHash);
  if (!valid) throw new ApiError(400, "Mật khẩu hiện tại không đúng");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.player.update({ where: { id }, data: { passwordHash } });

  return ok({ success: true });
});
