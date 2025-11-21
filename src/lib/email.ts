import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendEmail({
  to,
  subject,
  html,
  react,
}: {
  to: string;
  subject: string;
  html?: string;
  react?: React.ReactNode;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendNotification({
  to,
  title,
  message,
  actionLabel,
  actionUrl,
}: {
  to: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}) {
  const { NotificationEmail } = await import(
    "@/components/emails/notification-email"
  );
  const React = await import("react");

  return sendEmail({
    to,
    subject: title,
    react: React.createElement(NotificationEmail, {
      title,
      message,
      actionLabel,
      actionUrl,
    }),
  });
}
