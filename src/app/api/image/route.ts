import { badRequest, route } from "@/lib/route";

// GET /api/image?url=<encoded public R2 url> — streams a bucket image back from
// our own origin.
//
// Why this exists: the R2 public domain sends no CORS headers, so a browser
// canvas that has drawn one of those images is tainted and `toDataURL()` throws.
// The share-poster on /matches/:id/mvp is rendered to PNG in the browser, so its
// photos have to be same-origin. Loading them through here makes them so.
//
// This is deliberately NOT a general proxy: only https URLs whose origin exactly
// matches NEXT_PUBLIC_R2_PUBLIC_URL are fetched, so it can't be pointed at an
// internal address or used to launder someone else's traffic.
const allowedOrigin = (): string | null => {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) return null;
  try {
    return new URL(base).origin;
  } catch {
    return null;
  }
};

export const GET = route(async (req) => {
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) throw badRequest("Thiếu url");

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    throw badRequest("url không hợp lệ");
  }

  const allowed = allowedOrigin();
  if (!allowed) throw badRequest("Chưa cấu hình NEXT_PUBLIC_R2_PUBLIC_URL");
  if (target.protocol !== "https:" || target.origin !== allowed)
    throw badRequest("Chỉ cho phép ảnh từ kho ảnh của đội.");

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok || !upstream.body)
    throw badRequest(`Không tải được ảnh (${upstream.status})`);

  const type = upstream.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) throw badRequest("URL không phải ảnh");

  return new Response(upstream.body, {
    headers: {
      "content-type": type,
      // Immutable: every object key is a fresh uuid, so a URL never changes.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
});
