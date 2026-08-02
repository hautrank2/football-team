// Image upload uses multipart/form-data, so it bypasses the JSON http client.
export const uploadApi = {
  image: async (file: File, folder?: string): Promise<{ url: string }> => {
    const body = new FormData();
    body.append("file", file);
    if (folder) body.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? "Upload thất bại");
    }
    return res.json();
  },

  remove: async (url: string): Promise<void> => {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? "Xóa thất bại");
    }
  },
};
