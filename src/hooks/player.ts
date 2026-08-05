import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { playerApi } from "@/apis/player";
import type {
  AttributeUpsertDto,
  ChangePasswordDto,
  PlayerCreateDto,
  PlayerQueryDto,
  PlayerUpdateDto,
} from "@/types";

const KEY = "players";
const ATTR_KEY = "player-attribute";

export const usePlayers = (params: PlayerQueryDto) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => playerApi.list(params) });

export const usePlayer = (id?: string, populations?: string[]) =>
  useQuery({
    queryKey: [KEY, id, populations],
    queryFn: () => playerApi.get(id as string, populations),
    enabled: !!id,
  });

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

// Attribute set (returns null-ish via error when the player has none yet).
export const usePlayerAttribute = (id?: string) =>
  useQuery({
    queryKey: [ATTR_KEY, id],
    queryFn: () => playerApi.getAttribute(id as string),
    enabled: !!id,
    retry: false, // a 404 (no attributes yet) is expected, not a transient failure
  });

export const useUpsertAttribute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AttributeUpsertDto }) =>
      playerApi.upsertAttribute(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: [ATTR_KEY, id] });
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
};
