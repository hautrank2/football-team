// Central time + limit rules for the Schedule / Match feature.
//
// Every "thời gian & thời điểm" (deadline, window, kick-off hour, week range)
// and every field limit (note length, goals cap) lives HERE — never inline a
// magic number like `19`, `24`, or `100` at a call site. The API layer and the
// FE both import from this file so the vote window, the vote lock, the report
// window, and validation limits stay identical everywhere.
//
// All wall-clock reasoning is done in the club's local timezone (Asia/Ho_Chi_Minh).

import {
  addHours,
  addWeeks,
  endOfQuarter,
  endOfWeek,
  isWithinInterval,
  set,
  startOfDay,
  startOfQuarter,
} from "date-fns";

export const SCHEDULE = {
  // Tuần bắt đầu từ Thứ Hai (date-fns: 0 = CN ... 1 = T2). Dùng cho cửa sổ vote.
  WEEK_STARTS_ON: 1,

  // Player chỉ được vote cho TUẦN NÀY và TUẦN SAU (không vote quá khứ).
  VOTE_WEEKS_AHEAD: 1,

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

// Kick-off instant (19:00) for a given calendar day.
export const kickoffFor = (date: Date): Date =>
  set(startOfDay(date), {
    hours: SCHEDULE.KICKOFF_HOUR,
    minutes: SCHEDULE.KICKOFF_MINUTE,
    seconds: 0,
    milliseconds: 0,
  });

// The range of days a player may vote for right now: from the start of today
// (no voting in the past) through the end of next week.
export const voteWindow = (now: Date): TimeWindow => ({
  start: startOfDay(now),
  end: endOfWeek(addWeeks(now, SCHEDULE.VOTE_WEEKS_AHEAD), {
    weekStartsOn: SCHEDULE.WEEK_STARTS_ON,
  }),
});

// Can `date` still be voted for at `now`? Must be inside the vote window AND not
// yet locked. A day locks once its kick-off (19:00) has arrived.
export const isVotableDate = (date: Date, now: Date): boolean => {
  const { start, end } = voteWindow(now);
  const day = startOfDay(date);
  if (day < startOfDay(start) || day > end) return false;
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
// the current calendar quarter.
export const currentQuarter = (now: Date): TimeWindow => ({
  start: startOfQuarter(now),
  end: endOfQuarter(now),
});
