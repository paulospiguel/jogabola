import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  APP_URL,
  CardBody,
  CardFooter,
  EmailLayout,
  PrimaryButton,
  SectionTitle,
  colors,
} from "./base/email-layout";

interface EventReminderEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventId: number;
  hoursUntil: number;
  confirmedCount: number;
  totalSpots: number;
}

export function EventReminderEmail({
  name,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventId,
  hoursUntil,
  confirmedCount,
  totalSpots,
}: EventReminderEmailProps) {
  const firstName = name.split(" ")[0] ?? name;
  const eventUrl = `${APP_URL}/event/${eventId}`;
  const fillPct = Math.round((confirmedCount / totalSpots) * 100);

  const urgencyLabel =
    hoursUntil <= 2
      ? "Hoje!"
      : hoursUntil <= 24
        ? "Amanhã!"
        : `Em ${Math.round(hoursUntil / 24)} dias`;

  return (
    <EmailLayout
      preview={`🏆 ${urgencyLabel} ${eventTitle} — ${confirmedCount}/${totalSpots} confirmados`}
    >
      {/* Urgency stripe */}
      <div
        style={{
          height: 4,
          background:
            hoursUntil <= 24
              ? `linear-gradient(90deg, ${colors.danger} 0%, ${colors.primary} 100%)`
              : `linear-gradient(90deg, ${colors.info} 0%, ${colors.primary} 100%)`,
        }}
      />

      <CardBody>
        <SectionTitle>
          {hoursUntil <= 24 ? "🔔 Lembrete urgente" : "📅 Lembrete de evento"}
        </SectionTitle>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {firstName}, o jogo é {urgencyLabel.toLowerCase()}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          Confirmaste presença em <strong style={{ color: colors.text }}>{eventTitle}</strong>.
          Não te esqueças!
        </Text>

        {/* Event card */}
        <div
          style={{
            backgroundColor: "#0D1520",
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 15,
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
              style={{ fontSize: 13, color: colors.textSec, margin: "0 0 4px" }}
            >
              {icon} {label}
            </Text>
          ))}
        </div>

        {/* Fill bar */}
        <div
          style={{
            backgroundColor: "#0D1520",
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text
              style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}
            >
              Confirmados
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: confirmedCount >= totalSpots ? colors.danger : colors.success,
                margin: 0,
              }}
            >
              {confirmedCount}/{totalSpots}
            </Text>
          </div>
          {/* Progress bar via nested divs */}
          <div
            style={{
              height: 6,
              backgroundColor: colors.border,
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(fillPct, 100)}%`,
                backgroundColor:
                  fillPct >= 100 ? colors.danger : colors.success,
                borderRadius: 99,
              }}
            />
          </div>
        </div>

        <PrimaryButton href={eventUrl} label="Ver evento →" />
      </CardBody>

      <Section style={{ padding: "16px 28px 0" }} />

      <CardFooter>
        <Text
          style={{ fontSize: 11, color: colors.textFaint, margin: 0, lineHeight: 1.5 }}
        >
          Não podes comparecer? Acede ao evento e cancela a presença para
          liberares a vaga para um colega.
        </Text>
      </CardFooter>
    </EmailLayout>
  );
}

EventReminderEmail.PreviewProps = {
  name: "Ana Ferreira",
  eventTitle: "Jogo Semanal — Equipa Alpha",
  eventDate: "Sábado, 10 de Maio",
  eventTime: "19:00",
  eventLocation: "Campo Municipal de Alcochete",
  eventId: 42,
  hoursUntil: 20,
  confirmedCount: 11,
  totalSpots: 14,
} satisfies EventReminderEmailProps;

export default EventReminderEmail;
