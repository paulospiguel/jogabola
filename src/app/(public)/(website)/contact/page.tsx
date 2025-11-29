"use client";

import { sendEmail } from "@/actions/sendEmail";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/Text";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectTrigger } from "@radix-ui/react-select";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LuBook, LuBug, LuHand, LuMailQuestion } from "react-icons/lu";
import { z } from "zod";

const subjects = [
  { value: "suggestion", label: "Suggestion", icon: LuBook },
  { value: "bug", label: "Bug", icon: LuBug },
  { value: "question", label: "Question", icon: LuMailQuestion },
  { value: "other", label: "Other", icon: LuHand },
];

// Definição local do schema para validação no cliente
const contactSchema = z.object({
  name: z.string().min(2, "contact.name_required"),
  email: z.string().email("contact.email_invalid"),
  message: z.string().min(3, "contact.message_required"),
  subject: z.string().optional().default(subjects[0].value),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations();

  subjects.forEach(subject => {
    if (subject.value === "suggestion") {
      subject.label = t("contact.suggestion");
    } else if (subject.value === "bug") {
      subject.label = t("contact.bug");
    } else if (subject.value === "question") {
      subject.label = t("contact.question");
    } else if (subject.value === "other") {
      subject.label = t("contact.other");
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const handleFormSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Usando a rota de API em vez de Server Action
      const response = await sendEmail(data);

      if (!response.success) {
        throw new Error(String(response.error || t("contact.send_error")));
      }

      setSuccess(true);
      reset();
    } catch (err: unknown) {
      console.error("Erro ao enviar email:", err);
      const errorMessage = err instanceof Error ? err.message : t("contact.send_error");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-6">
      <Text variant="h2" fontWeight="bold">
        {t("contact.title")}
      </Text>
      <Text variant="h3" fontWeight="bold">
        {t("contact.subtitle")}
      </Text>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="space-y-4">
          <Select {...register("subject")} defaultValue={subjects[0].value}>
            <SelectTrigger
              tabIndex={0}
              aria-label={t("contact.subject")}
              className="h-10 w-full rounded-3xl border-2 data-[state=open]:border-teal-600 md:w-[180px]"
            >
              <SelectValue placeholder={t("contact.subject")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t("contact.subject")}</SelectLabel>
                {subjects.map(subject => (
                  <SelectItem key={subject.value} value={subject.value}>
                    <li className="flex items-center px-2">
                      <subject.icon className="mr-1 h-4 w-4" />
                      <span>{subject.label}</span>
                    </li>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            {...register("name")}
            placeholder={t("contact.name")}
            aria-label={t("contact.name")}
            tabIndex={0}
            autoComplete="name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <Text color="danger">{t(errors.name.message!)}</Text>}
          <Input
            {...register("email")}
            placeholder={t("contact.email")}
            aria-label={t("contact.email")}
            tabIndex={0}
            autoComplete="email"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <Text color="danger">{t(errors.email.message!)}</Text>
          )}
          <Textarea
            {...register("message")}
            placeholder={t("contact.message")}
            aria-label={t("contact.message")}
            tabIndex={0}
            rows={5}
            className={errors.message ? "border-red-500" : ""}
          />
          {errors.message && (
            <Text color="danger">{t(errors.message.message!)}</Text>
          )}
          <Button
            type="submit"
            disabled={loading}
            aria-label={t("contact.send")}
            className="float-right w-full rounded-4xl md:min-w-[120px] dark:bg-teal-800"
          >
            {loading ? (
              <Loading size="small" />
            ) : (
              <>
                <Send className="mr-2" />
                {t("contact.send")}
              </>
            )}
          </Button>
          {success && <Text color="green">{t("contact.send_success")}</Text>}
          {error && <Text color="red">{error}</Text>}
        </div>
      </form>
    </div>
  );
}
