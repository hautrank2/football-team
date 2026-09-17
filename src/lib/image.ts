// Fetch a (possibly cross-origin) image URL and wrap it as a File so it can be
// sent to the AI service / upload endpoint as multipart form-data.
export const urlToFile = async (url: string, name: string): Promise<File> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không tải được ảnh gốc");
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/png" });
};

// Player photos live on the R2 public domain, which sends no CORS headers.
// That breaks two things in the browser: a canvas that has drawn one cannot be
// exported (the MVP poster), and WebGL refuses to use one as a texture at all
// (the 3D pitch). Routing them through our own origin fixes both.
//
// The proxy itself (/api/image) only accepts URLs from that one bucket.
export const proxiedImage = (url?: string | null): string | undefined =>
  url ? `/api/image?url=${encodeURIComponent(url)}` : undefined;
