import { http } from "@/lib/http";
import type { LoginDto, PlayerModel } from "@/types";

export const authApi = {
  login: (body: LoginDto) => http.post<PlayerModel>("/api/auth/login", body),
};
