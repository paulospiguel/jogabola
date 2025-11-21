import { loadDataFromCloud, saveDataToCloud } from "@/actions/timer";
import { useEffect, useRef, useState } from "react";

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
  // 1. Initialize state from LocalStorage (Offline/Refresh capability)
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const isFirstLoad = useRef(true);

  // 2. Save to LocalStorage whenever state changes (Immediate persistence)
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
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
