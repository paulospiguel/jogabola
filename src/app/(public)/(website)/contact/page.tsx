"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/Text";
import Loading from "@/components/loading";
import { Send } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "contact.name_required"),
  email: z.string().email("contact.email_invalid"),
  message: z.string().min(10, "contact.message_required"),
});

interface ContactFormValues extends z.infer<typeof contactSchema> {}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations();

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(t("contact.send_error"));
      }
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.message || t("contact.send_error"));
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
            className="float-right min-w-[120px]"
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
