"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarColor, initials } from "./tokens";

interface JbAvatarProps {
  name: string;
  size?: number;
  id?: number | string;
  className?: string;
  image?: string | null;
}

export function JbAvatar({
  name,
  size = 36,
  id = 1,
  className,
  image,
}: JbAvatarProps) {
  const col = avatarColor(id);
  const ini = initials(name);
  const [hasError, setHasError] = useState(false);

  const isValidImage =
    image &&
    image !== "null" &&
    image !== "undefined" &&
    image !== "" &&
    (image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/") ||
      image.startsWith("data:"));

  const shouldRenderImage = isValidImage && !hasError;

  return (
    <Avatar
      className={className}
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${col}44`,
      }}
    >
      {shouldRenderImage && (
        <AvatarImage
          src={image}
          alt={name}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
      <AvatarFallback
        style={{
          background: `${col}22`,
          color: col,
          fontSize: size * 0.34,
          fontWeight: 700,
        }}
      >
        {ini}
      </AvatarFallback>
    </Avatar>
  );
}
