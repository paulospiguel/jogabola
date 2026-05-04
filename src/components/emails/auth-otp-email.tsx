import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  APP_URL,
  CardBody,
  CardFooter,
  EmailLayout,
  OtpBox,
  SectionTitle,
  colors,
} from "./base/email-layout";

interface AuthOtpEmailProps {
  otp: string;
  email?: string;
}

export function AuthOtpEmail({ otp, email }: AuthOtpEmailProps) {
  return (
    <EmailLayout preview={`${otp} — o teu código de acesso JogaBola`}>
      <CardBody>
        <SectionTitle>Código de acesso</SectionTitle>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          Entrar no JogaBola
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 4px",
            lineHeight: 1.6,
          }}
        >
          Usa este código para completar o teu login.
          {email && (
            <>
              {" "}
              Solicitado para{" "}
              <span style={{ color: colors.textSec, fontWeight: 600 }}>
                {email}
              </span>
              .
            </>
          )}
        </Text>
      </CardBody>

      <OtpBox code={otp} />

      <Section style={{ padding: "0 28px 24px" }}>
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            margin: "0 0 16px",
            padding: "12px 16px",
            backgroundColor: "#0B1622",
            borderRadius: 10,
            borderLeft: `3px solid ${colors.info}`,
          }}
        >
          ⏱ Expira em <strong style={{ color: colors.text }}>5 minutos</strong>.
          Não partilhes este código com ninguém.
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
          Não foste tu? Ignora este email — a tua conta está segura. Se
          receberes códigos sem teres solicitado, contacta-nos em{" "}
          <a
            href={`${APP_URL}/contact`}
            style={{ color: colors.textMuted, textDecoration: "underline" }}
          >
            suporte
          </a>
          .
        </Text>
      </CardFooter>
    </EmailLayout>
  );
}

AuthOtpEmail.PreviewProps = {
  otp: "847392",
  email: "jogador@exemplo.com",
} satisfies AuthOtpEmailProps;

export default AuthOtpEmail;
