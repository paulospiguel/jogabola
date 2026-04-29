import { avatarColor, initials } from "./tokens";

interface JbAvatarProps {
  name: string;
  size?: number;
  id?: number | string;
  className?: string;
}

export function JbAvatar({
  name,
  size = 36,
  id = 1,
  className,
}: JbAvatarProps) {
  const col = avatarColor(id);
  const ini = initials(name);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${col}22`,
        border: `1.5px solid ${col}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: col,
        fontSize: size * 0.34,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {ini}
    </div>
  );
}
