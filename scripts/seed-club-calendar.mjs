// Dev-only synthetic data for the stage 2 club calendar (ADR 0004/0005).
// Creates two clubs, their teams, seasons, opponents, fixtures and callups,
// plus one user per QA role. Re-running replaces the previous seed rows.
// Refuses to run against a non-local database host.
//
//   node scripts/seed-club-calendar.mjs
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const hostname = new URL(databaseUrl).hostname.toLowerCase();
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "postgres"]);
if (!localHosts.has(hostname) || process.env.NODE_ENV === "production") {
  throw new Error(`Refusing to seed synthetic data on host: ${hostname}`);
}

const TIME_ZONE = "Europe/Lisbon";
const EMAIL_DOMAIN = "jogabola.test";
const USERS = {
  captainA: { id: "seed-club-captain-a", name: "Rui Tavares", role: "captain" },
  athleteA: { id: "seed-club-athlete-a", name: "Tiago Mendes", role: "athlete" },
  coCaptainA: { id: "seed-club-cocaptain-a", name: "Nuno Faria", role: "athlete" },
  captainFree: { id: "seed-club-captain-free", name: "Inês Lobo", role: "captain" },
  captainB: { id: "seed-club-captain-b", name: "Sofia Ramos", role: "captain" },
  outsiderB: { id: "seed-club-outsider-b", name: "Hugo Pires", role: "athlete" },
};
const EMAILS = {
  captainA: `capitao.a@${EMAIL_DOMAIN}`,
  athleteA: `atleta.a@${EMAIL_DOMAIN}`,
  coCaptainA: `cocapitao.a@${EMAIL_DOMAIN}`,
  captainFree: `capitao.livre@${EMAIL_DOMAIN}`,
  captainB: `capitao.b@${EMAIL_DOMAIN}`,
  outsiderB: `membro.b@${EMAIL_DOMAIN}`,
};
const SEED_IDS = Object.values(USERS).map(user => user.id);

/** Wall-clock parts in Lisbon for `daysFromNow` at `hh:mm`, and its UTC instant. */
function lisbonSlot(daysFromNow, hh, mm) {
  const day = new Date(Date.now() + daysFromNow * 86_400_000);
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(day);
  const wall = `${ymd}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  // Lisbon is UTC+0 or UTC+1: try both offsets and keep the one that matches.
  for (const offset of ["+00:00", "+01:00"]) {
    const instant = new Date(`${wall}${offset}`);
    const back = new Intl.DateTimeFormat("sv-SE", {
      timeZone: TIME_ZONE,
      dateStyle: "short",
      timeStyle: "short",
    }).format(instant);
    if (back === `${ymd} ${wall.slice(11, 16)}`) {
      return { instant: instant.toISOString(), naive: wall.replace("T", " ") };
    }
  }
  return { instant: new Date(`${wall}Z`).toISOString(), naive: wall.replace("T", " ") };
}

const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });

try {
  const ids = await sql.begin(async tx => {
    // 1. Remove the previous seed. Teams first: teams.club_id is RESTRICT.
    const oldClubs = await tx`
      SELECT DISTINCT club_id AS id FROM club_members WHERE user_id IN ${tx(SEED_IDS)}
      UNION SELECT id FROM clubs WHERE created_by IN ${tx(SEED_IDS)}
    `;
    await tx`DELETE FROM teams WHERE owner_id IN ${tx(SEED_IDS)}`;
    if (oldClubs.length > 0) {
      await tx`DELETE FROM clubs WHERE id IN ${tx(oldClubs.map(c => c.id))}`;
    }
    await tx`DELETE FROM "user" WHERE id IN ${tx(SEED_IDS)} OR email IN ${tx(Object.values(EMAILS))}`;

    // 2. Users: onboarding done so the Arena opens straight away.
    for (const [key, user] of Object.entries(USERS)) {
      await tx`
        INSERT INTO "user" (id, name, email, email_verified, role, onboarding_completed, locale)
        VALUES (${user.id}, ${user.name}, ${EMAILS[key]}, true, ${user.role}, true, 'pt')
      `;
    }

    // 3. Teams.
    const team = async (name, slug, ownerId) =>
      (
        await tx`
          INSERT INTO teams (name, slug, owner_id, location, category)
          VALUES (${name}, ${slug}, ${ownerId}, 'Lisboa', 'Sénior')
          RETURNING id
        `
      )[0].id;
    const teamA = await team("Leões da Tapada", "seed-leoes-da-tapada", USERS.captainA.id);
    const teamA2 = await team("Leões da Tapada B", "seed-leoes-da-tapada-b", USERS.captainA.id);
    const teamFree = await team("Bairro Alto FC", "seed-bairro-alto-fc", USERS.captainFree.id);
    const teamB = await team("Dragões do Restelo", "seed-dragoes-do-restelo", USERS.captainB.id);

    const member = (teamId, userId, role) =>
      tx`INSERT INTO team_members (team_id, player_id, role, status) VALUES (${teamId}, ${userId}, ${role}, 'confirmed')`;
    await member(teamA, USERS.captainA.id, "owner");
    await member(teamA, USERS.athleteA.id, "player");
    await member(teamA, USERS.coCaptainA.id, "manager");
    await member(teamA2, USERS.captainA.id, "owner");
    await member(teamFree, USERS.captainFree.id, "owner");
    await member(teamB, USERS.captainB.id, "owner");
    await member(teamB, USERS.outsiderB.id, "player");

    // 4. Clubs and memberships (ADR 0005: synthetic membership rows).
    const club = async (name, createdBy) =>
      (await tx`INSERT INTO clubs (name, created_by) VALUES (${name}, ${createdBy}) RETURNING id`)[0].id;
    const clubA = await club("Clube Desportivo da Tapada", USERS.captainA.id);
    const clubB = await club("Restelo Futebol Clube", USERS.captainB.id);
    await tx`UPDATE teams SET club_id = ${clubA} WHERE id IN ${tx([teamA, teamA2])}`;
    await tx`UPDATE teams SET club_id = ${clubB} WHERE id = ${teamB}`;
    for (const [clubId, userId, role] of [
      [clubA, USERS.captainA.id, "admin"],
      [clubA, USERS.athleteA.id, "member"],
      [clubA, USERS.coCaptainA.id, "member"],
      [clubB, USERS.captainB.id, "admin"],
      [clubB, USERS.outsiderB.id, "member"],
    ]) {
      await tx`INSERT INTO club_members (club_id, user_id, role) VALUES (${clubId}, ${userId}, ${role})`;
    }

    // 5. Seasons and opponents. "2024/25" and "Grupo Desportivo da Ajuda"
    //    stay unused so QA can delete them; the others are "em uso".
    const season = async (clubId, name, startsOn, endsOn) =>
      (
        await tx`
          INSERT INTO seasons (club_id, name, starts_on, ends_on)
          VALUES (${clubId}, ${name}, ${startsOn}, ${endsOn}) RETURNING id
        `
      )[0].id;
    const seasonA = await season(clubA, "2026/27", "2026-08-01", "2027-06-30");
    const seasonAOld = await season(clubA, "2025/26", "2025-08-01", "2026-06-30");
    await season(clubA, "2024/25", "2024-08-01", "2025-06-30");
    const seasonB = await season(clubB, "2026/27", "2026-09-01", null);

    const opponent = async (clubId, name) =>
      (await tx`INSERT INTO opponents (club_id, name) VALUES (${clubId}, ${name}) RETURNING id`)[0].id;
    const alvito = await opponent(clubA, "Atlético do Alvito");
    const alcantara = await opponent(clubA, "Unidos de Alcântara");
    const belem = await opponent(clubA, "Belém Amador");
    await opponent(clubA, "Grupo Desportivo da Ajuda");
    const belenenses = await opponent(clubB, "Belenenses Veteranos");

    // 6. Fixtures.
    const fixture = async (clubId, teamId, seasonId, opponentId, competition, startsAt, createdBy) =>
      (
        await tx`
          INSERT INTO fixtures (club_id, team_id, season_id, opponent_id, competition_name, starts_at, created_by)
          VALUES (${clubId}, ${teamId}, ${seasonId}, ${opponentId}, ${competition}, ${startsAt}, ${createdBy})
          RETURNING id
        `
      )[0].id;
    const next = lisbonSlot(3, 15, 0);
    const fixtureLinked = await fixture(clubA, teamA, seasonA, alvito, "Campeonato Distrital", next.instant, USERS.captainA.id);
    const fixtureFree = await fixture(clubA, teamA, seasonA, alcantara, "Taça de Lisboa", lisbonSlot(10, 11, 0).instant, USERS.captainA.id);
    await fixture(clubA, teamA2, seasonA, belem, "Campeonato Distrital", lisbonSlot(17, 16, 30).instant, USERS.captainA.id);
    await fixture(clubA, teamA, seasonA, belem, "Campeonato Distrital", lisbonSlot(-7, 15, 0).instant, USERS.captainA.id);
    await fixture(clubA, teamA, seasonAOld, alcantara, "Taça de Lisboa", lisbonSlot(-200, 10, 30).instant, USERS.captainA.id);
    const fixtureB = await fixture(clubB, teamB, seasonB, belenenses, "Liga Veteranos", lisbonSlot(5, 20, 0).instant, USERS.captainB.id);

    // 7. Callups of team A: one linked to the next fixture, one free to link.
    const callup = async (teamId, title, startsAt) =>
      (
        await tx`
          INSERT INTO match_sessions (team_id, title, location, starts_at, capacity)
          VALUES (${teamId}, ${title}, 'Campo da Tapada', ${startsAt}, 16) RETURNING id
        `
      )[0].id;
    const callupLinked = await callup(teamA, "Jogo vs Atlético do Alvito", next.naive);
    const callupFree = await callup(teamA, "Jogo vs Unidos de Alcântara", lisbonSlot(10, 11, 0).naive);
    await tx`
      INSERT INTO fixture_match_sessions (fixture_id, team_id, match_session_id)
      VALUES (${fixtureLinked}, ${teamA}, ${callupLinked})
    `;
    for (const playerId of [USERS.captainA.id, USERS.athleteA.id]) {
      await tx`
        INSERT INTO attendance (match_session_id, player_id, status)
        VALUES (${callupLinked}, ${playerId}, 'confirmed')
      `;
    }

    return { clubA, clubB, teamA, teamA2, teamFree, teamB, fixtureLinked, fixtureFree, fixtureB, callupLinked, callupFree };
  });

  const rows = [
    ["captainA", "Capitão A: dono das equipas Leões da Tapada (A e B), admin do clube A — cria jogos, associa convocatórias, gere épocas"],
    ["athleteA", "Atleta A: plantel Leões da Tapada, membro do clube A — só leitura"],
    ["coCaptainA", "Co-capitão A: papel manager no plantel, membro do clube A — lê, não cria jogos (ADR 0005)"],
    ["captainFree", "Capitão sem clube: dono do Bairro Alto FC — estado vazio e \"Criar clube\""],
    ["captainB", "Capitão B: dono dos Dragões do Restelo, admin do clube B"],
    ["outsiderB", "Membro do clube B: não vê nada do clube A (isolamento)"],
  ];
  console.log("\nSeed do calendário de clubes criado (dados sintéticos).\n");
  for (const [key, description] of rows) {
    console.log(`  ${EMAILS[key].padEnd(28)} ${description}`);
  }
  console.log(`
IDs úteis:
  Clube A: /arena/club/${ids.clubA}      Clube B: /arena/club/${ids.clubB}
  Jogo A com convocatória: /arena/club/${ids.clubA}/fixtures/${ids.fixtureLinked}
  Jogo A sem convocatória: /arena/club/${ids.clubA}/fixtures/${ids.fixtureFree} (convocatória livre #${ids.callupFree})
  Jogo privado do clube B: fixture #${ids.fixtureB} (pedir via clube A deve dar "não encontrado")

Login local: SMTP_HOST= pnpm dev  →  pede o código no ecrã e lê-o no log ([auth:email-otp])
             ou: node scripts/local-otp.mjs <email>
`);
} finally {
  await sql.end({ timeout: 5 });
}
