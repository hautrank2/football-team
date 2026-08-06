import { http } from "@/lib/http";
import type { PlayerQuoteModel, TableResponseDto } from "@/types";

export type QuoteQueryDto = {
  subjectId?: string;
  authorId?: string;
  populations?: string[];
  page?: number;
  pageSize?: number;
};

export type QuoteCreateBody = { subjectId: string; authorId: string; content: string };

export const quoteApi = {
  list: ({ populations, ...rest }: QuoteQueryDto = {}) =>
    http.get<TableResponseDto<PlayerQuoteModel>>("/api/quote", {
      params: { ...rest, populations: populations?.join(",") },
    }),
  create: (body: QuoteCreateBody) => http.post<PlayerQuoteModel>("/api/quote", { body }),
  update: (id: string, content: string) =>
    http.patch<PlayerQuoteModel>(`/api/quote/${id}`, { body: { content } }),
  remove: (id: string) => http.delete<void>(`/api/quote/${id}`),
};
