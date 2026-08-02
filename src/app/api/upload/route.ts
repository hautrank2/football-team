import { badRequest, route } from "@/server/http";
import { deleteFromR2, uploadToR2 } from "@/server/r2";
import { ok } from "@/server/response";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const safeFolder = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string" || !value) return "avatars";
  return value.replace(/[^a-zA-Z0-9/_-]/g, "") || "avatars";
};

// POST /api/upload — multipart form-data: `file` (image) + optional `folder`. Returns { url }.
// NOTE: currently open (no auth) — gate behind a session once auth lands.
export const POST = route(async (req) => {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) throw badRequest("Thiếu file ảnh");
  if (!file.type.startsWith("image/")) throw badRequest("Chỉ chấp nhận ảnh");
  if (file.size > MAX_BYTES) throw badRequest("Ảnh tối đa 5MB");

  const url = await uploadToR2(file, safeFolder(form.get("folder")));
  return ok({ url });
});

// DELETE /api/upload — JSON body { url } (public URL or raw key). Removes the object.
export const DELETE = route(async (req) => {
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url) throw badRequest("Thiếu url");
  await deleteFromR2(url);
  return ok({ ok: true });
});
