import { http } from "@/lib/http";
import type { LoginDto, PlayerDto } from "@/types";

export const authApi = {
  login: (body: LoginDto) => http.post<PlayerDto>("/api/auth/login", { body }),
};
