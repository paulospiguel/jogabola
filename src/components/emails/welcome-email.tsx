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

interface WelcomeEmailProps {
  name: string;
  email?: string;
}

export function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  const firstName = name.split(" ")[0] ?? name;

  return (
    <EmailLayout
      preview={`Bem-vindo, ${firstName}! A tua conta JogaBola está pronta.`}
    >
      {/* Green accent stripe */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.info} 100%)`,
        }}
      />

      <CardBody>
        <SectionTitle>Conta criada</SectionTitle>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: colors.text,
            margin: "0 0 6px",
            lineHeight: 1.3,
          }}
        >
          Bem-vindo à Arena,{" "}
          <span style={{ color: colors.primary }}>{firstName}</span>!
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            margin: "0 0 24px",
            lineHeight: 1.7,
          }}
        >
          A tua conta JogaBola foi criada com sucesso
          {email ? ` para ${email}` : ""}. Estás pronto para jogar.
        </Text>

        {/* Feature pills */}
        <Section style={{ marginBottom: 24 }}>
          {[
            { emoji: "⚽", label: "Confirma presença nos jogos em segundos" },
            { emoji: "📊", label: "Histórico de presenças e estatísticas" },
            { emoji: "💰", label: "Acompanha pagamentos da equipa" },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#0D1520",
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
              <span
                style={{ fontSize: 13, color: colors.textSec, lineHeight: 1.4 }}
              >
                {label}
              </span>
            </div>
          ))}
        </Section>

        <PrimaryButton href={`${APP_URL}/arena`} label="Entrar na Arena →" />
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
          Recebeste este email porque criaste uma conta JogaBola. Se não
          reconheces esta conta,{" "}
          <a
            href={`${APP_URL}/contact`}
            style={{ color: colors.textMuted, textDecoration: "underline" }}
          >
            contacta o suporte
          </a>
          .
        </Text>
      </CardFooter>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  name: "João Silva",
  email: "joao@exemplo.com",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
