export const LIGA_STANDINGS = [
  { pos: 1, name: "Benfica B", j: 18, v: 13, e: 3, d: 2, pts: 42, own: false },
  { pos: 2, name: "FC Bairro Alto", j: 18, v: 11, e: 4, d: 3, pts: 37, own: true },
  { pos: 3, name: "Sporting C", j: 18, v: 10, e: 5, d: 3, pts: 35, own: false },
  { pos: 4, name: "Porto B", j: 18, v: 9, e: 4, d: 5, pts: 31, own: false },
  { pos: 5, name: "Académica", j: 18, v: 8, e: 5, d: 5, pts: 29, own: false },
  { pos: 6, name: "Belenenses", j: 18, v: 7, e: 6, d: 5, pts: 27, own: false },
  { pos: 7, name: "Estrela", j: 18, v: 6, e: 5, d: 7, pts: 23, own: false },
  { pos: 8, name: "Casa Pia B", j: 18, v: 5, e: 6, d: 7, pts: 21, own: false },
] as const;

export const TOP_SCORERS = [
  { id: 1, name: "Carlos Mendes", role: "Avançado", goals: 12 },
  { id: 2, name: "Rui Ferreira", role: "Médio", goals: 9 },
  { id: 3, name: "Pedro Alves", role: "Avançado", goals: 7 },
  { id: 4, name: "João Silva", role: "Médio", goals: 5 },
  { id: 5, name: "Miguel Costa", role: "Defesa", goals: 3 },
] as const;

export const TOP_ASSISTS = [
  { id: 1, name: "Rui Ferreira", role: "Médio", assists: 10 },
  { id: 2, name: "Carlos Mendes", role: "Avançado", assists: 7 },
  { id: 3, name: "André Santos", role: "Médio", assists: 6 },
  { id: 4, name: "Pedro Alves", role: "Avançado", assists: 4 },
  { id: 5, name: "Luís Pereira", role: "Lateral", assists: 3 },
] as const;
