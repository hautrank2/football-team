// Axios instance for our own JSON API. It's a plain `axios.create()` instance
// (just renamed to `http`) with two interceptors that preserve the app's
// existing contract:
//   • success → callers receive `ApiResponse.metadata` directly (not AxiosResponse)
//   • failure → a unified `HttpError` is thrown
// Because the success interceptor unwraps `metadata`, the instance is retyped as
// `Http` so `http.get<T>()` resolves to `T` rather than `AxiosResponse<T>`.

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiResponse, HttpError } from "@/types";

export type { HttpError };

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.response.use(
  // Unwrap the unified envelope; the cast bridges the runtime value (metadata)
  // back to the AxiosResponse type the interceptor signature expects.
  (res: AxiosResponse<ApiResponse<unknown>>) =>
    res.data?.metadata as unknown as AxiosResponse,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const payload = error.response?.data;
    const httpError: HttpError = {
      status: error.response?.status ?? 0,
      message: payload?.message ?? error.message,
      error: payload?.error ?? null,
    };
    return Promise.reject(httpError);
  }
);

// Typed view of the instance: methods resolve to the unwrapped payload `T`.
export interface Http {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

export const http = instance as unknown as Http;
