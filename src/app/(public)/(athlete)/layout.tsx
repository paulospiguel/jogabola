export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-arena-bg">{children}</div>;
}
