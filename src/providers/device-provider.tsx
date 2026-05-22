"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const MOBILE_BREAKPOINT = 768;

interface DeviceContextValue {
  /** `true` se o dispositivo/viewport é mobile */
  isMobile: boolean;
  /** `true` se o dispositivo/viewport é desktop */
  isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextValue>({
  isMobile: false,
  isDesktop: true,
});

interface DeviceProviderProps {
  /**
   * Hint vindo do servidor (User-Agent).
   * Usado como valor inicial antes de qualquer resize do cliente.
   */
  initialIsMobile: boolean;
  children: React.ReactNode;
}

/**
 * Fornece `isMobile` / `isDesktop` a toda a árvore.
 *
 * - O valor inicial vem do SSR (User-Agent), portanto não há flash.
 * - O cliente subscreve `matchMedia` e actualiza se o viewport mudar
 *   (útil em DevTools, tablets rotativos, etc.).
 */
export function DeviceProvider({
  initialIsMobile,
  children,
}: DeviceProviderProps) {
  const [isMobile, setIsMobile] = useState(initialIsMobile);

  const sync = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    // Sincronizar imediatamente com o viewport real
    sync();

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [sync]);

  return (
    <DeviceContext.Provider value={{ isMobile, isDesktop: !isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
}

/**
 * Hook para consumir o contexto de dispositivo.
 * Devolve `{ isMobile, isDesktop }`.
 */
export function useDevice(): DeviceContextValue {
  return useContext(DeviceContext);
}
