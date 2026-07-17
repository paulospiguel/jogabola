# 1. Defer external-league / season / standings model

Date: 2026-05-28

## Status

Accepted

## Context

The Rankings and Historical screens were built against mock data that depicts
**external league competition**: opponent clubs (e.g. "Benfica B", "Sporting C"),
a regional league table with positions, and per-season W/D/L records and results
against opponents.

The existing domain has **no support for any of this**. A Convocatória
(`MatchSession`) is an internal event (Jogo/Treino) with a location and a roster,
and `team-balancer.actions.ts` splits the team's own roster into two sides — i.e.
the product today models **internal pickup football**, not fixtures against other
clubs. There is no Opponent, League, Fixture, Standing, Season, or player
goal/assist statistic in the schema or glossary.

Making Rankings/Historical "fully functional" would therefore require a large new
domain (clubs, leagues, fixtures, standings, seasons) **plus** data-entry flows
(a game-report form capturing scores, goals, assists) to populate it — far beyond
wiring existing tables.

## Decision

Defer the external-league/season/standings domain. Rankings and Historical remain
on mock data behind a "em breve" (coming soon) treatment until the results model is
designed. Profile stat tiles (goals/assists/rating/wins/position) are hidden for the
same reason; the Profile teams list is wired to real `teamMembers` data.

## Consequences

- Rankings and Historical ship as visibly-deferred, not broken or fake-but-live.
- No premature schema for leagues/seasons that we'd likely redesign once the
  game-report flow is specified.
- When revisited, the foundational decision (internal-only vs external-league vs
  hybrid match model) must be made first — it gates the entire results schema.
