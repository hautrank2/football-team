import { prisma } from "@/lib/prisma";
import { route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { avatarNoBgUpdate } from "@/types";

type Params = { id: string };

// PATCH /api/player/:id/avatar-nobg — persist the background-removed avatar URL
// produced by the AI service. Kept as its own domain so the remove-bg flow is
// decoupled from the generic player update.
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { avatarNoBg } = await parseBody(req, avatarNoBgUpdate);

  const player = await prisma.player.update({
    where: { id },
    data: { avatarNoBg },
    omit: { passwordHash: true },
  });
  return ok(player);
});
