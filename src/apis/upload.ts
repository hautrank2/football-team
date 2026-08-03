import type { ApiResponse, UploadResultDto } from "@/types";

// Image upload uses multipart/form-data, so it bypasses the JSON http client.
// It still unwraps the unified ApiResponse envelope by hand.
export const uploadApi = {
  image: async (file: File, folder?: string): Promise<UploadResultDto> => {
    const body = new FormData();
    body.append("file", file);
    if (folder) body.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body });
    const json = (await res.json().catch(() => undefined)) as ApiResponse<UploadResultDto> | undefined;
    if (!res.ok) throw new Error(typeof json?.message === "string" ? json.message : "Upload thất bại");
    return json?.metadata as UploadResultDto;
  },

  remove: async (url: string): Promise<void> => {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => undefined)) as ApiResponse<unknown> | undefined;
      throw new Error(typeof json?.message === "string" ? json.message : "Xóa thất bại");
    }
  },
};
