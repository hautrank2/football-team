// Axios instance for the standalone AI image service (NEXT_PUBLIC_AI_DOMAIN).
// It's a plain `axios.create()` instance (just renamed to `httpAi`) — callers use
// the native axios API and read `res.data`. Unlike `http`, this host doesn't use
// our JSON envelope: requests are multipart/form-data and responses are raw
// binary (an image), with errors as `{ detail }`.

import axios, { type AxiosError } from "axios";
import type { HttpError } from "@/types";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AI_DOMAIN ?? "",
});

// Fail fast (with a clear message) if the AI domain env var is missing, instead
// of silently hitting the current origin.
instance.interceptors.request.use((config) => {
  if (!config.baseURL) throw new Error("Chưa cấu hình NEXT_PUBLIC_AI_DOMAIN");
  return config;
});

// Map the service's `{ detail }` error onto our unified HttpError. Success bodies
// are binary (`blob`/`arraybuffer`), so error bodies come back in that form too —
// decode them to text before pulling out `detail`.
instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const data = error.response?.data;
    let detail: string | undefined;
    let text: string | undefined;
    if (data instanceof Blob) {
      text = await data.text().catch(() => undefined);
    } else if (data instanceof ArrayBuffer) {
      text = new TextDecoder().decode(data);
    } else if (data && typeof data === "object") {
      detail = (data as { detail?: string }).detail;
    } else if (typeof data === "string") {
      text = data;
    }
    if (text) {
      try {
        detail = (JSON.parse(text) as { detail?: string })?.detail;
      } catch {
        // non-JSON error body — keep detail undefined
      }
    }
    const httpError: HttpError = {
      status: error.response?.status ?? 0,
      message: detail ?? error.message,
      error: data ?? null,
    };
    return Promise.reject(httpError);
  }
);

export const httpAi = instance;
