interface AppVersionProps {
  label: string;
  version: string;
}

export function AppVersion({ label, version }: AppVersionProps) {
  return <span>{`v${version} • ${label}`}</span>;
}
