import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  APP_URL,
  CardBody,
  CardFooter,
  colors,
  EmailLayout,
  OtpBox,
  SectionTitle,
} from "./base/email-layout";

interface GuestRsvpOtpEmailProps {
  name: string;
  otp: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
}

export function GuestRsvpOtpEmail({
  name,
  otp,
  eventTitle,
  eventDate,
  eventLocation,
}: GuestRsvpOtpEmailProps) {
  const firstName = name.split(" ")[0] ?? name;

  return (
    <EmailLayout
      preview={`${otp} — confirma a tua presença${eventTitle ? ` em ${eventTitle}` : ""}`}
    >
      <CardBody>
        <SectionTitle>Confirmação de presença</SectionTitle>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          Olá, {firstName}! 👋
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 4px",
            lineHeight: 1.6,
          }}
        >
          Usa este PIN para confirmar a tua presença{eventTitle ? ` em` : "."}
          {eventTitle && (
            <strong style={{ color: colors.text }}>{` "${eventTitle}"`}</strong>
          )}
          {eventTitle && "."}
        </Text>
      </CardBody>

      {/* Event info card */}
      {(eventTitle || eventDate || eventLocation) && (
        <Section style={{ padding: "0 28px" }}>
          <div
            style={{
              backgroundColor: "#0D1520",
              border: `1px solid ${colors.border}`,
              borderLeft: `3px solid ${colors.primary}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            {eventTitle && (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.text,
                  margin: "0 0 6px",
                }}
              >
                {eventTitle}
              </Text>
            )}
            {eventDate && (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  margin: "0 0 2px",
                }}
              >
                📅 {eventDate}
              </Text>
            )}
            {eventLocation && (
              <Text
                style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}
              >
                📍 {eventLocation}
              </Text>
            )}
          </div>
        </Section>
      )}

      <OtpBox code={otp} />

      <Section style={{ padding: "0 28px 24px" }}>
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            margin: 0,
            padding: "12px 16px",
            backgroundColor: "#0B1622",
            borderRadius: 10,
            borderLeft: `3px solid ${colors.info}`,
          }}
        >
          ⏱ Expira em <strong style={{ color: colors.text }}>10 minutos</strong>
          . Introduz este código no campo PIN do site.
        </Text>
      </Section>

      <CardFooter>
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            margin: "0 0 8px",
            fontWeight: 600,
          }}
        >
          Quer uma conta JogaBola?
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: colors.textFaint,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Cria uma conta gratuita em{" "}
          <a
            href={`${APP_URL}/auth`}
            style={{
              color: colors.primary,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            jogabola.app
          </a>{" "}
          para gerir presenças, pagamentos e estatísticas sem precisar de PIN em
          cada evento.
        </Text>
      </CardFooter>
    </EmailLayout>
  );
}

GuestRsvpOtpEmail.PreviewProps = {
  name: "Maria Costa",
  otp: "384921",
  eventTitle: "Jogo Semanal — Equipa Alpha",
  eventDate: "Sáb, 10 Mai · 19:00",
  eventLocation: "Campo Municipal de Alcochete",
} satisfies GuestRsvpOtpEmailProps;

export default GuestRsvpOtpEmail;
