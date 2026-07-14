const fallbackLocks = new Map<string, Promise<void>>();

async function withFallbackTournamentLock<T>(
  tournamentId: string,
  work: () => Promise<T>,
): Promise<T> {
  const previous = fallbackLocks.get(tournamentId) ?? Promise.resolve();
  let release = () => {};
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });
  const queued = previous.catch(() => undefined).then(() => gate);
  fallbackLocks.set(tournamentId, queued);
  await previous.catch(() => undefined);
  try {
    return await work();
  } finally {
    release();
    if (fallbackLocks.get(tournamentId) === queued) {
      fallbackLocks.delete(tournamentId);
    }
  }
}

/** Serializes the full read/write/readback sequence for one tournament. */
export async function withTournamentLock<T>(
  tournamentId: string,
  work: () => Promise<T>,
): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request(`jb-tournament-${tournamentId}`, work);
  }
  return withFallbackTournamentLock(tournamentId, work);
}
