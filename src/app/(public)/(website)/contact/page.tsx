"use client";

import { motion } from "framer-motion";
import { ArrowLeft, AtSign, Instagram, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { APP } from "@/constants/app";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const contactMethods = [
    {
      icon: Mail,
      title: t("methods.email.label"),
      value: APP.CONTACT.SUPPORT_EMAIL,
      href: `mailto:${APP.CONTACT.SUPPORT_EMAIL}`,
    },
    {
      icon: Instagram,
      title: t("methods.instagram.label"),
      value: APP.CONTACT.INSTAGRAM_HANDLE,
      href: APP.SOCIAL.INSTAGRAM,
    },
    {
      icon: AtSign,
      title: t("methods.x.label"),
      value: APP.CONTACT.X_HANDLE,
      href: APP.SOCIAL.TWITTER,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="flex justify-start">
            <Button
              variant="ghost"
              asChild
              className="press mb-8 text-gray-400 hover:text-white"
            >
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("backHome")}
              </Link>
            </Button>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold text-white md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            {t("description")}
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.href}
              target={method.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={
                method.href.startsWith("mailto:")
                  ? undefined
                  : "noopener noreferrer"
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="press group flex items-center gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/10 lg:flex-col lg:items-start"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white transition-transform group-hover:scale-110">
                <method.icon className="h-7 w-7" />
              </div>
              <div className="w-full min-w-0">
                <h2 className="mb-1 text-sm font-bold tracking-widest text-gray-400 uppercase">
                  {method.title}
                </h2>
                <p className="break-words text-lg font-bold text-white">
                  {method.value}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </main>
  );
}
