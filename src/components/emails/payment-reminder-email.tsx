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

interface PaymentReminderEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  amountCents: number;
  currency: string; // "EUR"
  eventId: number;
  deadlineHours: number; // hours until payment deadline expires
}

export function PaymentReminderEmail({
  name,
  eventTitle,
  eventDate,
  eventTime,
  amountCents,
  currency,
  eventId,
  deadlineHours,
}: PaymentReminderEmailProps) {
  const firstName = name.split(" ")[0] ?? name;
  const paymentUrl = `${APP_URL}/event/${eventId}?openPayment=1`;
  const formattedAmount = `${currency === "EUR" ? "€" : currency}${(amountCents / 100).toFixed(2)}`;

  const urgencyLabel =
    deadlineHours <= 1
      ? "Menos de 1 hora"
      : deadlineHours <= 3
        ? `${deadlineHours}h restantes`
        : `${deadlineHours}h para o prazo`;

  return (
    <EmailLayout
      preview={`⚠️ Pagamento pendente — ${urgencyLabel} — ${eventTitle}`}
    >
      {/* Urgency stripe */}
      <div
        style={{
          height: 4,
          background: deadlineHours <= 2
            ? `linear-gradient(90deg, ${colors.danger} 0%, ${colors.primary} 100%)`
            : `linear-gradient(90deg, ${colors.warning ?? "#f59e0b"} 0%, ${colors.primary} 100%)`,
        }}
      />

      <CardBody>
        <SectionTitle>💳 Pagamento pendente</SectionTitle>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {firstName}, confirma o pagamento!
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          A tua reserva em <strong style={{ color: colors.text }}>{eventTitle}</strong> está
          pendente de pagamento. Tens <strong style={{ color: deadlineHours <= 2 ? colors.danger : colors.text }}>{urgencyLabel}</strong> para completar o pagamento.
        </Text>

        {/* Amount card */}
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
            { icon: "💳", label: `Valor: ${formattedAmount}` },
          ].map(({ icon, label }) => (
            <Text
              key={label}
              style={{ fontSize: 13, color: colors.textSec, margin: "0 0 4px" }}
            >
              {icon} {label}
            </Text>
          ))}
        </div>

        {/* Warning box */}
        <div
          style={{
            backgroundColor: deadlineHours <= 2 ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
            border: `1px solid ${deadlineHours <= 2 ? colors.danger : (colors.warning ?? "#f59e0b")}33`,
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: deadlineHours <= 2 ? colors.danger : colors.text,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {deadlineHours <= 2
              ? "⚠️ O prazo está quase a expirar. A tua reserva pode ser cancelada automaticamente."
              : "ℹ️ Completa o pagamento para garantires o teu lugar no jogo."}
          </Text>
        </div>

        <PrimaryButton href={paymentUrl} label="Pagar agora →" />
      </CardBody>

      <Section style={{ padding: "16px 28px 0" }} />

      <CardFooter>
        <Text
          style={{ fontSize: 11, color: colors.textFaint, margin: 0, lineHeight: 1.5 }}
        >
          Se não pretendes participar, acede ao evento e cancela a presença.
        </Text>
      </CardFooter>
    </EmailLayout>
  );
}

PaymentReminderEmail.PreviewProps = {
  name: "João Silva",
  eventTitle: "Jogo Semanal — Equipa Alpha",
  eventDate: "Sábado, 10 de Maio",
  eventTime: "19:00",
  amountCents: 500,
  currency: "EUR",
  eventId: 42,
  deadlineHours: 2,
} satisfies PaymentReminderEmailProps;

export default PaymentReminderEmail;
