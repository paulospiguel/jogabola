import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  APP_URL,
  CardBody,
  CardFooter,
  colors,
  EmailLayout,
  PrimaryButton,
  SectionTitle,
} from "./base/email-layout";

interface AttendanceConfirmedEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventId: number;
  isGuest?: boolean;
  spotsLeft?: number;
}

export function AttendanceConfirmedEmail({
  name,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventId,
  isGuest = false,
  spotsLeft,
}: AttendanceConfirmedEmailProps) {
  const firstName = name.split(" ")[0] ?? name;
  const eventUrl = `${APP_URL}/event/${eventId}`;

  return (
    <EmailLayout
      preview={`✅ Presença confirmada em ${eventTitle} — ${eventDate}`}
    >
      {/* Success stripe */}
      <div style={{ height: 4, backgroundColor: colors.success }} />

      <CardBody>
        <SectionTitle>Presença confirmada</SectionTitle>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          Estás dentro, {firstName}!{" "}
          <span style={{ color: colors.success }}>✅</span>
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          A tua presença foi confirmada. Guarda estes detalhes.
        </Text>

        {/* Event card */}
        <div
          style={{
            backgroundColor: "#0D1520",
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              backgroundColor: colors.primaryDim,
              borderBottom: `1px solid ${colors.border}`,
              padding: "10px 16px",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: colors.primary,
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Detalhes do evento
            </Text>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: colors.text,
                margin: "0 0 10px",
              }}
            >
              {eventTitle}
            </Text>
            {[
              { icon: "📅", label: eventDate },
              { icon: "🕐", label: eventTime },
              { icon: "📍", label: eventLocation },
            ].map(({ icon, label }) => (
              <Text
                key={label}
                style={{
                  fontSize: 13,
                  color: colors.textSec,
                  margin: "0 0 4px",
                  lineHeight: 1.5,
                }}
              >
                {icon} {label}
              </Text>
            ))}
            {typeof spotsLeft === "number" && spotsLeft >= 0 && (
              <Text
                style={{
                  fontSize: 12,
                  color: spotsLeft <= 3 ? colors.danger : colors.success,
                  margin: "8px 0 0",
                  fontWeight: 600,
                }}
              >
                {spotsLeft === 0
                  ? "Jogo cheio — estás na lista de espera"
                  : `${spotsLeft} vaga${spotsLeft === 1 ? "" : "s"} restante${spotsLeft === 1 ? "" : "s"}`}
              </Text>
            )}
          </div>
        </div>

        <PrimaryButton href={eventUrl} label="Ver evento →" />
      </CardBody>

      <Section style={{ padding: "16px 28px 0" }} />

      <CardFooter>
        {isGuest ? (
          <Text
            style={{
              fontSize: 11,
              color: colors.textFaint,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Confirmaste como convidado. Cria uma conta gratuita em{" "}
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
            para gerir futuras presenças mais rapidamente.
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 11,
              color: colors.textFaint,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Precisas de cancelar? Acede ao evento e clica em "Cancelar presença"
            antes do início.
          </Text>
        )}
      </CardFooter>
    </EmailLayout>
  );
}

AttendanceConfirmedEmail.PreviewProps = {
  name: "Pedro Oliveira",
  eventTitle: "Jogo Semanal — Equipa Alpha",
  eventDate: "Sábado, 10 de Maio",
  eventTime: "19:00",
  eventLocation: "Campo Municipal de Alcochete",
  eventId: 42,
  isGuest: false,
  spotsLeft: 3,
} satisfies AttendanceConfirmedEmailProps;

export default AttendanceConfirmedEmail;
