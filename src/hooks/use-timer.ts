import { loadDataFromCloud, saveDataToCloud } from "@/actions/timer";
import { useEffect, useRef, useState } from "react";
import {
  readPersistedTimerValue,
  writePersistedTimerValue,
} from "@/features/timer/lib/timer-utils";

// Better Auth user type - simple object with essential properties
type BetterAuthUser =
  | {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  | null
  | undefined;

export function useTimer<T>(
  key: string,
  initialValue: T,
  user: BetterAuthUser,
) {
  const [state, setState] = useState<T>(initialValue);

  const isFirstLoad = useRef(true);
  const hasHydratedFromStorage = useRef(false);

  // 1. Hydrate from LocalStorage only on the client.
  useEffect(() => {
    const persistedValue = readPersistedTimerValue(key, initialValue);
    setState(persistedValue);
    hasHydratedFromStorage.current = true;
  }, [initialValue, key]);

  // 2. Save to LocalStorage whenever state changes (Immediate persistence)
  useEffect(() => {
    if (!hasHydratedFromStorage.current) {
      return;
    }

    writePersistedTimerValue(key, state);
  }, [key, state]);

  // 3. Sync with Cloud when User logs in
  useEffect(() => {
    if (user) {
      // When user logs in, try to fetch cloud data
      // Strategy: Cloud data overwrites local data on login if it exists
      loadDataFromCloud<T>(user.id, key).then(cloudData => {
        if (cloudData) {
          setState(cloudData as T);
        } else {
          // If no cloud data, upload current local data
          saveDataToCloud(user.id, key, state);
        }
      });
    }
  }, [user?.id, key]); // Only run on login change

  // 4. Push changes to Cloud when state changes (if logged in)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (user) {
      // Debounce could be added here for performance
      const timeoutId = setTimeout(() => {
        saveDataToCloud(user.id, key, state);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [state, user, key]);

  return [state, setState] as const;
}
