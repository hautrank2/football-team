import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quoteApi, type QuoteCreateBody, type QuoteQueryDto } from "@/apis/quote";

const KEY = "quotes";

export const useQuotes = (params: QuoteQueryDto) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => quoteApi.list(params) });

export const useCreateQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuoteCreateBody) => quoteApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quoteApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
