import { unzipSync } from "fflate";
import { httpAi } from "@/lib/http";

// AI image-processing service. Built on the `httpAi` axios instance (its own
// domain, NEXT_PUBLIC_AI_DOMAIN) which speaks multipart in / binary out rather
// than our JSON ApiResponse envelope.
//
// `remove-bg` takes one part per image (the FormData key becomes the filename in
// the zip) and always responds with a ZIP of transparent PNGs — even for a single
// image — so we unzip client-side and hand back the PNG blob(s).

const REMOVE_BG_PATH = "/image/remove-bg";

// Extract every entry of the zip as a PNG blob, keyed by its filename (sans ".png").
const unzipToBlobs = (buf: ArrayBuffer): Record<string, Blob> => {
  const files = unzipSync(new Uint8Array(buf));
  const out: Record<string, Blob> = {};
  for (const [name, bytes] of Object.entries(files)) {
    // `bytes` is a Uint8Array; copy into a fresh buffer so the Blob owns its data.
    out[name.replace(/\.png$/i, "")] = new Blob([bytes.slice()], {
      type: "image/png",
    });
  }
  return out;
};

export const aiApi = {
  // Remove one image's background. Returns the resulting transparent PNG blob.
  removeBg: async (file: File): Promise<Blob> => {
    const form = new FormData();
    form.append("avatar", file); // -> "avatar.png" inside the zip

    const res = await httpAi.post<ArrayBuffer>(REMOVE_BG_PATH, form, {
      responseType: "arraybuffer",
    });
    const blobs = Object.values(unzipToBlobs(res.data));
    if (!blobs.length) throw new Error("AI không trả về ảnh nào");
    return blobs[0];
  },

  // Remove backgrounds for several images at once. Returns a map keyed by the
  // FormData key you provide (also the zip entry name).
  removeBgBatch: async (
    files: Record<string, File>,
  ): Promise<Record<string, Blob>> => {
    const form = new FormData();
    for (const [key, file] of Object.entries(files)) form.append(key, file);

    const res = await httpAi.post<ArrayBuffer>(REMOVE_BG_PATH, form, {
      responseType: "arraybuffer",
    });
    return unzipToBlobs(res.data);
  },
};
