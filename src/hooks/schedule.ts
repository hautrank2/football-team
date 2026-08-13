import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaderboardApi, matchApi, matchVoteApi, myMatchesApi } from "@/apis/schedule";
import type {
  LeaderboardQueryDto,
  MatchCreateDto,
  MatchQueryDto,
  MatchSettleCostDto,
  MatchUpdateDto,
  MatchVoteQueryDto,
  MatchVoteUpsertDto,
  MvpVoteDto,
  ParticipantAddDto,
  ParticipantPaymentDto,
  ReportStatsDto,
} from "@/types";

const VOTES = "match-votes";
const MATCHES = "matches";
const LEADERBOARD = "leaderboard";
const MY_MATCHES = "my-matches";

// Invalidate everything that a match mutation can touch.
const useInvalidateMatch = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [MATCHES] });
    qc.invalidateQueries({ queryKey: [VOTES] });
    qc.invalidateQueries({ queryKey: [LEADERBOARD] });
    qc.invalidateQueries({ queryKey: [MY_MATCHES] });
  };
};

// ---- Votes ----
export const useMatchVotes = (params: MatchVoteQueryDto) =>
  useQuery({ queryKey: [VOTES, params], queryFn: () => matchVoteApi.list(params) });

export const useUpsertMatchVote = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: (body: MatchVoteUpsertDto) => matchVoteApi.upsert(body),
    onSuccess: invalidate,
  });
};

export const useDeleteMatchVote = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({ mutationFn: (id: string) => matchVoteApi.remove(id), onSuccess: invalidate });
};

// ---- Matches ----
export const useMatches = (params: MatchQueryDto) =>
  useQuery({ queryKey: [MATCHES, params], queryFn: () => matchApi.list(params) });

export const useMatch = (id?: string) =>
  useQuery({ queryKey: [MATCHES, id], queryFn: () => matchApi.get(id as string), enabled: !!id });

export const useCreateMatch = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({ mutationFn: (body: MatchCreateDto) => matchApi.create(body), onSuccess: invalidate });
};

export const useUpdateMatch = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MatchUpdateDto }) => matchApi.update(id, body),
    onSuccess: invalidate,
  });
};

export const useSettleCost = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MatchSettleCostDto }) =>
      matchApi.settleCost(id, body),
    onSuccess: invalidate,
  });
};

export const useReportStats = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReportStatsDto }) =>
      matchApi.reportStats(id, body),
    onSuccess: invalidate,
  });
};

export const useVoteMvp = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MvpVoteDto }) => matchApi.voteMvp(id, body),
    onSuccess: invalidate,
  });
};

export const useSetPayment = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, pid, body }: { id: string; pid: string; body: ParticipantPaymentDto }) =>
      matchApi.setPayment(id, pid, body),
    onSuccess: invalidate,
  });
};

// Admin adds a player (+ guest count) to the match participant list.
export const useAddParticipant = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ParticipantAddDto }) =>
      matchApi.addParticipant(id, body),
    onSuccess: invalidate,
  });
};

// Admin removes a participant from the match (by MatchPlayer id).
export const useRemoveParticipant = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, pid }: { id: string; pid: string }) =>
      matchApi.removeParticipant(id, pid),
    onSuccess: invalidate,
  });
};

// Remove many participants at once. Run SEQUENTIALLY (not Promise.all): each
// removal re-splits the field cost across whoever's left, so the calls must not
// race — the last one must see all prior deletions to land the correct amounts.
export const useRemoveParticipantsBulk = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: async ({ id, pids }: { id: string; pids: string[] }) => {
      for (const pid of pids) await matchApi.removeParticipant(id, pid);
    },
    onSuccess: invalidate,
  });
};

// Mark many participants paid/unpaid at once (no bulk endpoint → fan out, then
// invalidate a single time).
export const useSetPaymentBulk = () => {
  const invalidate = useInvalidateMatch();
  return useMutation({
    mutationFn: ({ id, pids, isPaid }: { id: string; pids: string[]; isPaid: boolean }) =>
      Promise.all(pids.map((pid) => matchApi.setPayment(id, pid, { isPaid }))),
    onSuccess: invalidate,
  });
};

// ---- Leaderboard & my matches ----
export const useLeaderboard = (params: LeaderboardQueryDto & { metric?: "goals" | "assists" }) =>
  useQuery({ queryKey: [LEADERBOARD, params], queryFn: () => leaderboardApi.get(params) });

export const useMyMatches = (playerId?: string) =>
  useQuery({
    queryKey: [MY_MATCHES, playerId],
    queryFn: () => myMatchesApi.get(playerId as string),
    enabled: !!playerId,
  });
