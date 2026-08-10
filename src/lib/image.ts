// Fetch a (possibly cross-origin) image URL and wrap it as a File so it can be
// sent to the AI service / upload endpoint as multipart form-data.
export const urlToFile = async (url: string, name: string): Promise<File> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không tải được ảnh gốc");
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/png" });
};
