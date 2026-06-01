/**
 * Feature flags do JogaBola MVP.
 *
 * Controla a superfície visível da app sem apagar código.
 * Para activar uma feature, muda o valor para `true` aqui
 * (ou sobrepõe via env var numa fase posterior).
 *
 * Regra dos 3 toques: após registo, o capitão deve conseguir
 * marcar jogo → convocar → ver lista sem passar por nenhuma
 * feature desactivada.
 */
export const FEATURES = {
  /**
   * Tabela de rankings da equipa / liga.
   * Off no MVP — requer dados suficientes para ser credível.
   */
  rankings: false,

  /**
   * Chat por evento (powered by Ably).
   * Off no MVP — WhatsApp substitui, sem perda para o capitão.
   */
  eventChat: false,

  /**
   * Chat entre jogadores (mensagens directas).
   * Off no MVP.
   */
  playerChat: false,

  /**
   * Sistema de multas automáticas por falta.
   * Off no MVP — tóxico para o utilizador casual no dia 1.
   */
  fines: false,

  /**
   * Balanceador de equipas por IA.
   * Off no MVP — depende de ratings reais (Fase 2).
   */
  teamBalancer: false,

  /**
   * Histórico de época (temporadas anteriores).
   * Off no MVP.
   */
  seasonHistory: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Helper para verificar se uma feature está activa.
 * Uso: `isEnabled("rankings")`
 */
export function isEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature];
}
