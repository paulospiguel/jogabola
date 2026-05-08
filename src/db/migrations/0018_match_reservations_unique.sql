CREATE UNIQUE INDEX IF NOT EXISTS "match_reservations_session_player_idx"
  ON "match_reservations" ("match_session_id", "player_id");
