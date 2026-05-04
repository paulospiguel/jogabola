export async function onUserCreated(user: { name: string; email: string }) {
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error("[user-lifecycle] Failed to send welcome email:", error);
  }
}
