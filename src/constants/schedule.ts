// Central time + limit rules for the Schedule / Match feature.
//
// Every "thời gian & thời điểm" (deadline, window, kick-off hour, week range)
// and every field limit (note length, goals cap) lives HERE — never inline a
// magic number like `19`, `24`, or `100` at a call site. The API layer and the
// FE both import from this file so the vote window, the vote lock, the report
// window, and validation limits stay identical everywhere.
//
// All wall-clock reasoning is done in the club's local timezone (Asia/Ho_Chi_Minh).
//
// IMPORTANT — server-independence: we NEVER rely on the process/host timezone
// (no `startOfDay`/`startOfWeek` from date-fns, which resolve in the runtime TZ).
// The club plays in Vietnam — a FIXED UTC+7 offset, no DST — so that offset is a
// fact about the club, not the server. Every calendar-day value is anchored to
// UTC midnight ("floating date": 2026-08-12T00:00:00.000Z ⇒ the day is 12/08),
// and every wall-clock instant (19:00 kick-off, week bounds) is derived with the
// explicit VN offset below. Result: identical behaviour no matter where you deploy.

import { addHours, isWithinInterval } from "date-fns";

// Đội đá ở VN (UTC+7, không DST). Hằng số MÔ TẢ VIỆT NAM — không phải server.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// The VN calendar day of an instant, as UTC midnight. Idempotent on values that
// are already day-anchored. This is the single normalisation used everywhere.
export const vnDay = (instant: Date): Date =>
  new Date(Math.floor((instant.getTime() + VN_OFFSET_MS) / DAY_MS) * DAY_MS);

// End of that VN day (…23:59:59.999) — for inclusive `lte` day-range queries.
export const vnDayEnd = (instant: Date): Date =>
  new Date(vnDay(instant).getTime() + DAY_MS - 1);

// Monday-start of the VN week containing `day` (UTC-midnight in, UTC-midnight out).
const startOfVnWeek = (day: Date): Date => {
  const d = vnDay(day);
  const dow = d.getUTCDay(); // 0 = CN … 6 = T7
  const backToMonday = dow === 0 ? 6 : dow - 1;
  return new Date(d.getTime() - backToMonday * DAY_MS);
};

export const SCHEDULE = {
  // Tuần bắt đầu từ Thứ Hai (date-fns: 0 = CN ... 1 = T2). Dùng cho cửa sổ vote.
  WEEK_STARTS_ON: 1,

  // Player được vote cho TUẦN NÀY và 3 TUẦN KẾ TIẾP (~1 tháng), không vote quá
  // khứ. Cửa sổ = [đầu hôm nay, hết tuần thứ VOTE_WEEKS_AHEAD kể từ tuần này].
  VOTE_WEEKS_AHEAD: 3,

  // Giờ bóng lăn mặc định: "từ 19h trở đi". Cũng là mốc khóa vote của ngày đó.
  KICKOFF_HOUR: 19,
  KICKOFF_MINUTE: 0,

  // Sau trận (kể từ giờ bóng lăn): player nhập bàn thắng/kiến tạo + bầu MVP
  // chỉ trong 24h. (Admin nhập tiền sân thì KHÔNG giới hạn thời gian.)
  REPORT_WINDOW_HOURS: 24,

  // Điểm uy tín khởi tạo cho mỗi player.
  INITIAL_REPUTATION: 100,

  // Múi giờ tham chiếu cho mọi so sánh thời điểm.
  TIMEZONE: "Asia/Ho_Chi_Minh",
} as const;

// Field limits (validate ở tầng API bằng zod).
export const SCHEDULE_LIMITS = {
  NOTE_MAX: 300, // giới hạn ký tự cho mọi field note
  ADDRESS_MAX: 200, // giới hạn ký tự địa chỉ
  GOALS_MAX: 100, // tối đa bàn thắng / trận / player
  ASSISTS_MAX: 100, // tối đa kiến tạo / trận / player
  GUEST_MAX: 20, // tối đa khách mời / player / trận
} as const;

// A [start, end] instant range.
export type TimeWindow = { start: Date; end: Date };

// Kick-off instant (19:00 VN) for a given calendar day. 19:00 VN == (19 − 7) =
// 12:00 UTC of that day, i.e. the day's UTC midnight + (KICKOFF − offset).
export const kickoffFor = (date: Date): Date =>
  new Date(
    vnDay(date).getTime() +
      (SCHEDULE.KICKOFF_HOUR * 60 + SCHEDULE.KICKOFF_MINUTE) * 60 * 1000 -
      VN_OFFSET_MS,
  );

// The range of days a player may vote for right now: from the start of today
// (no voting in the past) through the end of the week VOTE_WEEKS_AHEAD from now.
export const voteWindow = (now: Date): TimeWindow => {
  const start = vnDay(now);
  // End = last ms of the week VOTE_WEEKS_AHEAD from this week (Mon-start).
  const end = new Date(
    startOfVnWeek(now).getTime() +
      (SCHEDULE.VOTE_WEEKS_AHEAD + 1) * 7 * DAY_MS -
      1,
  );
  return { start, end };
};

// Can `date` still be voted for at `now`? Must be inside the vote window AND not
// yet locked. A day locks once its kick-off (19:00 VN) has arrived.
export const isVotableDate = (date: Date, now: Date): boolean => {
  const { start, end } = voteWindow(now);
  const day = vnDay(date);
  if (day < start || day > end) return false;
  return now < kickoffFor(date);
};

// Post-match window during which goal/assist reporting and MVP voting are
// allowed: [kick-off, kick-off + 24h]. (NOT applied to admin cost entry.)
export const reportWindow = (kickoffAt: Date): TimeWindow => ({
  start: kickoffAt,
  end: addHours(kickoffAt, SCHEDULE.REPORT_WINDOW_HOURS),
});

// Is the post-match reporting window open for a match at `now`?
export const isReportWindowOpen = (kickoffAt: Date, now: Date): boolean =>
  isWithinInterval(now, reportWindow(kickoffAt));

// Has the reporting window closed (so MVP can be finalized)?
export const isReportWindowClosed = (kickoffAt: Date, now: Date): boolean =>
  now > reportWindow(kickoffAt).end;

// Default date range for the leaderboards ("vua phá lưới" / "vua kiến tạo"):
// the current calendar quarter (VN), UTC-anchored.
export const currentQuarter = (now: Date): TimeWindow => {
  const d = vnDay(now);
  const q = Math.floor(d.getUTCMonth() / 3);
  return {
    start: new Date(Date.UTC(d.getUTCFullYear(), q * 3, 1)),
    end: new Date(Date.UTC(d.getUTCFullYear(), q * 3 + 3, 1) - 1),
  };
};
