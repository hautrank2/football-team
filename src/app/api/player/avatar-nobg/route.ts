import { prisma } from "@/lib/prisma";
import { route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { avatarNoBgBulkUpdate } from "@/types";

// PATCH /api/player/avatar-nobg — bulk-persist background-removed avatars for
// several players in a single request (one transaction). This static segment
// takes precedence over the dynamic `[id]` sibling, so real player ids still
// resolve to `[id]/avatar-nobg`.
export const PATCH = route(async (req) => {
  const { items } = await parseBody(req, avatarNoBgBulkUpdate);

  const updated = await prisma.$transaction(
    items.map(({ id, avatarNoBg }) =>
      prisma.player.update({
        where: { id },
        data: { avatarNoBg },
        omit: { passwordHash: true },
      })
    )
  );
  return ok(updated);
});
