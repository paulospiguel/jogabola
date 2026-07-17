interface MobileWrapperProps {
  children: React.ReactNode;
}

/**
 * Passthrough do shell da app (arena).
 *
 * A moldura de iPhone (IPhoneMockup) foi removida por não ser eficiente:
 * o layout da arena já é responsivo (sidebar em desktop, top-bar + bottom-nav
 * em mobile). A moldura estava a forçar esse layout para dentro de um telemóvel.
 */
export function MobileWrapper({ children }: MobileWrapperProps) {
  return <>{children}</>;
}
