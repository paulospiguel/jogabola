import { AthleteHeader } from "./_components/athlete-header";

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-arena-bg">
    <AthleteHeader />
    {children}
  </div>;
}
