import { http } from "@/lib/http";
import type {
  LeaderboardQueryDto,
  LeaderboardRow,
  MatchCreateDto,
  MatchModel,
  MatchMvpVoteModel,
  MatchPlayerModel,
  MatchQueryDto,
  MatchSettleCostDto,
  MatchUpdateDto,
  MatchVoteModel,
  MatchVoteQueryDto,
  MatchVoteUpsertDto,
  MvpVoteDto,
  MyMatchesSummary,
  ParticipantAddDto,
  ParticipantPaymentDto,
  ReportStatsDto,
  TableResponseDto,
} from "@/types";

export const matchVoteApi = {
  list: ({ populations, ...rest }: MatchVoteQueryDto = {}) =>
    http.get<TableResponseDto<MatchVoteModel>>("/api/match-vote", {
      params: { ...rest, populations: populations?.join(",") },
    }),
  upsert: (body: MatchVoteUpsertDto) => http.post<MatchVoteModel>("/api/match-vote", body),
  remove: (id: string) => http.delete<void>(`/api/match-vote/${id}`),
};

export const matchApi = {
  list: ({ populations, ...rest }: MatchQueryDto = {}) =>
    http.get<TableResponseDto<MatchModel>>("/api/match", {
      params: { ...rest, populations: populations?.join(",") },
    }),
  get: (id: string) => http.get<MatchModel>(`/api/match/${id}`),
  create: (body: MatchCreateDto) => http.post<MatchModel>("/api/match", body),
  update: (id: string, body: MatchUpdateDto) => http.patch<MatchModel>(`/api/match/${id}`, body),
  settleCost: (id: string, body: MatchSettleCostDto) =>
    http.post<MatchModel>(`/api/match/${id}/settle-cost`, body),
  reportStats: (id: string, body: ReportStatsDto) =>
    http.post<MatchPlayerModel>(`/api/match/${id}/stats`, body),
  voteMvp: (id: string, body: MvpVoteDto) =>
    http.post<MatchMvpVoteModel>(`/api/match/${id}/mvp`, body),
  setPayment: (id: string, pid: string, body: ParticipantPaymentDto) =>
    http.patch<MatchPlayerModel>(`/api/match/${id}/player/${pid}`, body),
  // Admin adds a player (+ guest count) to the participant list.
  addParticipant: (id: string, body: ParticipantAddDto) =>
    http.post<MatchPlayerModel>(`/api/match/${id}/player`, body),
  // Admin removes a participant (MatchPlayer id) from the match.
  removeParticipant: (id: string, pid: string) =>
    http.delete<void>(`/api/match/${id}/player/${pid}`),
};

export const leaderboardApi = {
  get: (params: LeaderboardQueryDto & { metric?: "goals" | "assists" } = {}) =>
    http.get<LeaderboardRow[]>("/api/leaderboard", { params }),
};

export const myMatchesApi = {
  get: (playerId: string) =>
    http.get<MyMatchesSummary>("/api/me/matches", { params: { playerId } }),
};
