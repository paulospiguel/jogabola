import { headers } from "next/headers";
import { MobileWrapper } from "@/components/arena/mobile-wrapper";
import { isMobileUA } from "@/lib/device";
import { DeviceProvider } from "@/providers/device-provider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();

  // Deteção SSR: evita flash de layout no cliente
  const ua = headerStore.get("user-agent");
  const initialIsMobile = isMobileUA(ua);

  return (
    <DeviceProvider initialIsMobile={initialIsMobile}>
      <MobileWrapper>{children}</MobileWrapper>
    </DeviceProvider>
  );
}
