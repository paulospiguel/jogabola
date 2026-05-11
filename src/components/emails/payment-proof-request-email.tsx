import { Section, Text } from "@react-email/components";
import {
  APP_URL,
  CardBody,
  CardFooter,
  colors,
  EmailLayout,
  PrimaryButton,
  SectionTitle,
} from "./base/email-layout";

interface PaymentProofRequestEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  amountCents: number;
  currency: string;
  eventId: number;
  paymentId: number;
}

export function PaymentProofRequestEmail({
  name,
  eventTitle,
  eventDate,
  eventTime,
  amountCents,
  currency,
  eventId,
  paymentId,
}: PaymentProofRequestEmailProps) {
  const firstName = name.split(" ")[0] ?? name;
  const proofUrl = `${APP_URL}/event/${eventId}/payment/result/${paymentId}`;
  const formattedAmount = `${currency === "EUR" ? "EUR " : `${currency} `}${(
    amountCents / 100
  )
    .toFixed(2)
    .replace(".", ",")}`;

  return (
    <EmailLayout preview={`Comprovativo em falta — ${eventTitle}`}>
      <CardBody>
        <SectionTitle>Comprovativo em falta</SectionTitle>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {firstName}, envia o comprovativo
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          O capitão precisa do comprovativo para validar o teu pagamento em{" "}
          <strong style={{ color: colors.text }}>{eventTitle}</strong>.
        </Text>

        <div
          style={{
            backgroundColor: "#0D1520",
            border: `1px solid ${colors.border}`,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          {[
            { label: "Data", value: eventDate },
            { label: "Hora", value: eventTime },
            { label: "Valor", value: formattedAmount },
          ].map(item => (
            <Text
              key={item.label}
              style={{ fontSize: 13, color: colors.textSec, margin: "0 0 6px" }}
            >
              <strong style={{ color: colors.text }}>{item.label}:</strong>{" "}
              {item.value}
            </Text>
          ))}
        </div>

        <PrimaryButton href={proofUrl} label="Enviar comprovativo" />
      </CardBody>

      <Section style={{ padding: "16px 28px 0" }} />

      <CardFooter>
        <Text
          style={{
            fontSize: 11,
            color: colors.textFaint,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Se já enviaste o comprovativo, podes ignorar este email.
        </Text>
      </CardFooter>
    </EmailLayout>
  );
}

PaymentProofRequestEmail.PreviewProps = {
  name: "João Silva",
  eventTitle: "Brazil Club",
  eventDate: "11/05/2026",
  eventTime: "16:34",
  amountCents: 400,
  currency: "EUR",
  eventId: 42,
  paymentId: 1,
} satisfies PaymentProofRequestEmailProps;

export default PaymentProofRequestEmail;
