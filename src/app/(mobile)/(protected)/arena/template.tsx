export default function ArenaTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="jb-screen-fade w-full">{children}</div>;
}
