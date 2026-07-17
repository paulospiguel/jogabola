"use client";

import { useCallback, useEffect, useState } from "react";

interface GuestData {
  id: string;
  email: string;
  name: string;
  token?: string;
}

const STORAGE_KEY = "jogabola.guest_session";

export function useGuestSession() {
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setGuest(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse guest session", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveGuest = useCallback((data: GuestData) => {
    setGuest(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const clearGuest = useCallback(() => {
    setGuest(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    guest,
    saveGuest,
    clearGuest,
    isLoaded,
  };
}
