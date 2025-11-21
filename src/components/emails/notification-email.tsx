import * as React from "react";

interface NotificationEmailProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

export const NotificationEmail: React.FC<NotificationEmailProps> = ({
  title,
  message,
  actionLabel,
  actionUrl,
}) => (
  <div style={{ fontFamily: "sans-serif", color: "#333" }}>
    <h1>{title}</h1>
    <p>{message}</p>
    {actionLabel && actionUrl && (
      <a
        href={actionUrl}
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#050312",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "5px",
          marginTop: "20px",
        }}
      >
        {actionLabel}
      </a>
    )}
  </div>
);
