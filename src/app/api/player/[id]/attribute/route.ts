import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/server/http";
import { ok } from "@/server/response";
import { parseBody, parseId } from "@/server/validation";
import { attributeUpsert } from "@/server/schemas";

type Params = { id: string };

// GET /api/player/:id/attribute
export const GET = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);
  const attribute = await prisma.playerAttribute.findUnique({ where: { playerId: id } });
  if (!attribute) throw notFound("Attribute");
  return ok(attribute);
});

// PATCH /api/player/:id/attribute — upsert the full attribute set
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const data = await parseBody(req, attributeUpsert);

  const attribute = await prisma.playerAttribute.upsert({
    where: { playerId: id },
    create: { ...data, player: { connect: { id } } },
    update: data,
  });
  return ok(attribute);
});
