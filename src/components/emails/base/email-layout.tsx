import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type * as React from "react";

// Design tokens (arena dark theme)
export const colors = {
  bg: "#0B0F14",
  surface: "#111827",
  surfaceEl: "#1A2235",
  border: "#263244",
  primary: "#7CFF4F",
  primaryDim: "#1A3A1F",
  info: "#5B9BFF",
  infoDim: "#12224A",
  success: "#22C55E",
  successDim: "#0E2A1A",
  danger: "#EF4444",
  dangerDim: "#2A0E0E",
  warning: "#F59E0B",
  warningDim: "#3F220B",
  text: "#F5F7FA",
  textSec: "#C5CDD8",
  textMuted: "#A7B0BE",
  textFaint: "#6B7280",
};

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://jogabola.app";
export const FROM_NAME = "JogaBola";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="pt" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: colors.bg,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            margin: 0,
            padding: "32px 16px",
          }}
        >
          <Container
            style={{
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            {/* Logo header */}
            <Section
              style={{
                textAlign: "center",
                paddingBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: colors.primary,
                  letterSpacing: "-0.5px",
                  margin: 0,
                }}
              >
                JOGABOLA
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: colors.textMuted,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  margin: "2px 0 0",
                }}
              >
                ARENA
              </Text>
            </Section>

            {/* Main card */}
            <Section
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {children}
            </Section>

            {/* Footer */}
            <Section style={{ paddingTop: 24, textAlign: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textFaint,
                  margin: "0 0 4px",
                }}
              >
                © {new Date().getFullYear()} JogaBola · Todos os direitos
                reservados
              </Text>
              <Text
                style={{ fontSize: 11, color: colors.textFaint, margin: 0 }}
              >
                <a
                  href={`${APP_URL}/privacy`}
                  style={{
                    color: colors.textFaint,
                    textDecoration: "underline",
                  }}
                >
                  Privacidade
                </a>
                {" · "}
                <a
                  href={`${APP_URL}/terms`}
                  style={{
                    color: colors.textFaint,
                    textDecoration: "underline",
                  }}
                >
                  Termos
                </a>
                {" · "}
                <a
                  href={`${APP_URL}/contact`}
                  style={{
                    color: colors.textFaint,
                    textDecoration: "underline",
                  }}
                >
                  Contacto
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Shared card sections
export function CardBody({ children }: { children: React.ReactNode }) {
  return <Section style={{ padding: "28px 28px 8px" }}>{children}</Section>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: colors.surfaceEl,
        borderTop: `1px solid ${colors.border}`,
        padding: "16px 28px",
      }}
    >
      {children}
    </Section>
  );
}

export function OtpBox({ code }: { code: string }) {
  return (
    <Section style={{ padding: "20px 28px" }}>
      <div
        style={{
          backgroundColor: "#0B1622",
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          padding: "18px 24px",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "12px",
            color: colors.primary,
            fontFamily: "'Courier New', monospace",
            margin: 0,
            textShadow: `0 0 20px ${colors.primary}40`,
          }}
        >
          {code}
        </Text>
      </div>
    </Section>
  );
}

export function PrimaryButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        backgroundColor: colors.primary,
        color: "#0B0F14",
        fontWeight: 800,
        fontSize: 14,
        textAlign: "center",
        padding: "14px 24px",
        borderRadius: 12,
        textDecoration: "none",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </a>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: colors.textMuted,
        letterSpacing: "2px",
        textTransform: "uppercase",
        margin: "0 0 12px",
      }}
    >
      {children}
    </Text>
  );
}
