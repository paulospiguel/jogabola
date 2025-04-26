"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// Definir o schema dentro da função para evitar exportá-lo diretamente
const contactSchema = z.object({
  name: z.string().min(2, "contact.name_required"),
  email: z.string().email("contact.email_invalid"),
  message: z.string().min(3, "contact.message_required"),
  subject: z.string().optional().default("contact.subject"),
});

// Exportar o tipo para uso no cliente
export type ContactFormValues = z.infer<typeof contactSchema>;

export async function sendEmail(input: ContactFormValues) {
  try {
    const { email, message, name, subject } = contactSchema.parse(input);

    const result = await resend.emails.send({
      from:
        process.env.NEXT_PUBLIC_RESEND_EMAIL_FROM || "no-reply@jogabola.fun",
      to: [email],
      subject: `${name} - ${subject || "Contact"}`,
      html: message,
    });

    return {
      success: !result.error,
      error: result.error,
      data: result.data,
    };
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao enviar email",
      data: null,
    };
  }
}
