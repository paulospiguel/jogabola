"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Instagram,
  Mail,
  MessageSquare,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "suporte@jogabola.pt",
      href: "mailto:suporte@jogabola.pt",
      color: "blue",
    },
    {
      icon: Instagram,
      title: "Instagram",
      value: "@jogabola",
      href: "https://instagram.com/jogabola",
      color: "pink",
    },
    {
      icon: Twitter,
      title: "Twitter",
      value: "@jogabola",
      href: "https://twitter.com/jogabola",
      color: "sky",
    },
    {
      icon: MessageSquare,
      title: "Discord",
      value: "Comunidade JogaBola",
      href: "#",
      color: "emerald",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
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
              className="mb-8 text-gray-400 hover:text-white"
            >
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>

          <h1 className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl mb-6">
            Fala Connosco
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tens dúvidas, sugestões ou apenas queres dizer olá? Estamos aqui
            para ajudar a tua equipa a entrar em campo.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {contactMethods.map((method, i) => (
            <motion.a
              key={method.title}
              href={method.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/10 group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white group-hover:scale-110 transition-transform">
                <method.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-1">
                  {method.title}
                </h3>
                <p className="text-lg font-bold text-white">{method.value}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </main>
  );
}
