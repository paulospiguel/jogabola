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

interface TeamTransferEmailProps {
  teamName: string;
  fromName: string;
  /** Already formatted for display (pt-PT). */
  expiresAt: string;
  token: string;
}

export function TeamTransferEmail({
  teamName,
  fromName,
  expiresAt,
  token,
}: TeamTransferEmailProps) {
  return (
    <EmailLayout preview={`${fromName} quer passar-te a equipa ${teamName}`}>
      <CardBody>
        <SectionTitle>Transferência de equipa</SectionTitle>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          Queres ficar com a equipa {teamName}?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: colors.textSec, fontWeight: 600 }}>
            {fromName}
          </span>{" "}
          quer passar-te a gestão da equipa{" "}
          <strong style={{ color: colors.text }}>{teamName}</strong> no
          JogaBola. Ao aceitar, passas a ser o dono da equipa.
        </Text>

        <PrimaryButton
          href={`${APP_URL}/transfer/${token}`}
          label="Ver pedido de transferência"
        />
      </CardBody>

      <Section style={{ padding: "16px 28px 24px" }}>
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
          O pedido expira a{" "}
          <strong style={{ color: colors.text }}>{expiresAt}</strong>. Os
          métodos de pagamento online da equipa ficam desativados até os
          configurares.
        </Text>
      </Section>

      <CardFooter>
        <Text
          style={{
            fontSize: 11,
            color: colors.textFaint,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Não estavas à espera deste pedido? Ignora este email — nada muda até o
          aceitares.
        </Text>
      </CardFooter>
    </EmailLayout>
  );
}

TeamTransferEmail.PreviewProps = {
  teamName: "Os Leões da Tapada",
  fromName: "João Silva",
  expiresAt: "4 de dezembro de 2026",
  token: "preview-token",
} satisfies TeamTransferEmailProps;

export default TeamTransferEmail;
