/**
 * Utilitários de deteção de dispositivo — server-side only.
 * Usa o User-Agent do pedido HTTP para determinar se é mobile ou desktop.
 * Sem heurísticas de viewport; só UA parsing leve sem dependências externas.
 */

const MOBILE_UA_RE =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;

/**
 * Retorna `true` se o User-Agent corresponder a um dispositivo móvel.
 * Usar apenas em Server Components (necessita de `headers()` do Next.js).
 */
export function isMobileUA(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return MOBILE_UA_RE.test(userAgent);
}
