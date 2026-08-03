import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { playerApi } from "@/apis/player";
import type { ChangePasswordDto, PlayerCreateDto, PlayerQueryDto, PlayerUpdateDto } from "@/types";

const KEY = "players";

export const usePlayers = (params: PlayerQueryDto) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => playerApi.list(params) });

export const usePlayer = (id?: string) =>
  useQuery({ queryKey: [KEY, id], queryFn: () => playerApi.get(id as string), enabled: !!id });

export const useCreatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlayerCreateDto) => playerApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PlayerUpdateDto }) => playerApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeletePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playerApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useResetPlayerPassword = () =>
  useMutation({
    mutationFn: ({ id, username }: { id: string; username: string }) =>
      playerApi.resetPassword(id, username),
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: ({ id, ...body }: { id: string } & ChangePasswordDto) =>
      playerApi.changePassword(id, body),
  });
