import { http } from "@/apis/http";
import type { PlayerDto } from "@/apis/player";

export type LoginInput = { username: string; password: string };

export const authApi = {
  login: (body: LoginInput) => http.post<PlayerDto>("/api/auth/login", { body }),
};
