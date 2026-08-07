import { prisma } from "@/lib/prisma";
import { route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { participantPayment } from "@/types";

type Params = { id: string; pid: string };

// PATCH /api/match/:id/player/:pid — admin marks a participant paid / unpaid.
// `pid` is the MatchPlayer id.
export const PATCH = route<Params>(async (req, { params }) => {
  const { pid } = await params;
  parseId(pid);
  const { isPaid } = await parseBody(req, participantPayment);
  return ok(await prisma.matchPlayer.update({ where: { id: pid }, data: { isPaid } }));
});
