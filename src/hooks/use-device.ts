/**
 * Hook de deteção de dispositivo.
 *
 * Re-exporta `useDevice` do DeviceProvider para facilitar a importação
 * em qualquer Client Component sem precisar de importar o provider.
 *
 * @example
 * const { isMobile, isDesktop } = useDevice();
 */
export { useDevice } from "@/providers/device-provider";
