export const SEASONS = [
  { year: "2024/25", status: "Em curso", v: 11, e: 4, d: 3, pts: 37, pos: 2, champion: false },
  { year: "2023/24", status: "Concluída", v: 16, e: 5, d: 5, pts: 53, pos: 1, champion: true },
  { year: "2022/23", status: "Concluída", v: 12, e: 7, d: 7, pts: 43, pos: 3, champion: false },
  { year: "2021/22", status: "Concluída", v: 9, e: 8, d: 7, pts: 35, pos: 5, champion: false },
] as const;

export const RECENT_RESULTS = [
  { opp: "Sporting C", home: true, r: "E", score: "1-1", date: "12 Abr" },
  { opp: "Benfica B", home: false, r: "V", score: "3-1", date: "5 Abr" },
  { opp: "Porto B", home: true, r: "D", score: "0-2", date: "27 Mar" },
  { opp: "Académica", home: false, r: "V", score: "2-0", date: "15 Mar" },
  { opp: "Belenenses", home: true, r: "V", score: "4-1", date: "1 Mar" },
] as const;

export const RESULT_STYLE: Record<string, { text: string; bg: string }> = {
  V: { text: "text-arena-success", bg: "bg-arena-success/20" },
  E: { text: "text-arena-warning", bg: "bg-arena-warning/20" },
  D: { text: "text-arena-danger", bg: "bg-arena-danger/20" },
};
