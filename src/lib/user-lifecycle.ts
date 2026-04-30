export async function onUserCreated(user: { name: string; email: string }) {
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
    console.info(`[user-lifecycle] skipping welcome email in dev for ${user.email}`);
    return;
  }

  try {
    const { sendEmail } = await import("@/lib/email");
    const { WelcomeEmail } = await import("@/components/emails/welcome-email");
    const React = await import("react");
    await sendEmail({
      to: user.email,
      subject: "Bem-vindo à Jogabola Arena!",
      react: React.createElement(WelcomeEmail, { username: user.name }),
    });
  } catch (error) {
    console.error("[user-lifecycle] Failed to send welcome email:", error);
  }
}
