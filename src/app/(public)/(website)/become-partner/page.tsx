"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  CheckCircle,
  Sparkles,
  Users,
  Globe,
  TrendingUp,
  Award,
  Heart,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  category: "premium" | "official" | "supporter";
  message: string;
}

const FloatingOrb = ({
  delay,
  size,
  position,
}: {
  delay: number;
  size: number;
  position: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * 100 - 50],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
    className={cn(
      "absolute rounded-full bg-gradient-to-r from-[#00cfb1]/20 to-[#1effbf]/20 blur-xl",
      position,
    )}
    style={{ width: size, height: size }}
  />
);

const BenefitCard = ({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: any;
  title: string;
  description: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="group relative rounded-2xl border border-[#00cfb1]/20 bg-gradient-to-br from-[#2b0071]/20 to-[#21005a]/20 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#00cfb1]/40"
  >
    <div className="mb-4 flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6 text-[#21005a]" />
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="leading-relaxed text-[#ba93ff]">{description}</p>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#00cfb1]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  </motion.div>
);

const CategoryCard = ({
  category,
  title,
  description,
  features,
  price,
  isPopular,
  onSelect,
  isSelected,
}: {
  category: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  isPopular?: boolean;
  onSelect: (category: string) => void;
  isSelected: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    onClick={() => onSelect(category)}
    className={cn(
      "relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300",
      isSelected
        ? "border-[#00cfb1] bg-gradient-to-br from-[#00cfb1]/10 to-[#1effbf]/10"
        : "border-[#00cfb1]/20 bg-gradient-to-br from-[#2b0071]/20 to-[#21005a]/20 hover:border-[#00cfb1]/40",
      isPopular && "ring-2 ring-[#00cfb1]/50",
    )}
  >
    {isPopular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
        <span className="rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] px-4 py-1 text-sm font-bold text-[#21005a]">
          Mais Popular
        </span>
      </div>
    )}

    <div className="mb-6 text-center">
      <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
      <p className="mb-4 text-[#ba93ff]">{description}</p>
      <div className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
        {price}
      </div>
    </div>

    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#00cfb1]" />
          <span className="text-white">{feature}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

export default function BecomePartnerPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    category: "official",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefits = [
    {
      icon: Globe,
      title: "Visibilidade Global",
      description:
        "Alcance milhares de jogadores, treinadores e fãs de futebol em todo o mundo através da nossa plataforma.",
    },
    {
      icon: Users,
      title: "Comunidade Apaixonada",
      description:
        "Conecte-se com uma comunidade vibrante e engajada que vive e respira futebol todos os dias.",
    },
    {
      icon: TrendingUp,
      title: "Crescimento Conjunto",
      description:
        "Cresça connosco enquanto expandimos para novos mercados e desenvolvemos novas funcionalidades.",
    },
    {
      icon: Sparkles,
      title: "Co-criação de Conteúdo",
      description:
        "Participe na criação de conteúdo exclusivo e campanhas que ressoam com a nossa audiência.",
    },
    {
      icon: Award,
      title: "Reconhecimento Premium",
      description:
        "Destaque a sua marca como pioneira na transformação digital do futebol amador.",
    },
    {
      icon: Heart,
      title: "Impacto Social",
      description:
        "Contribua para o desenvolvimento do desporto e criação de oportunidades para jovens talentos.",
    },
  ];

  const categories = [
    {
      category: "supporter",
      title: "Apoiante",
      description: "Ideal para pequenas empresas e startups",
      price: "Desde €500/mês",
      features: [
        "Logo na seção de apoiantes",
        "Menção nas redes sociais",
        "Acesso a relatórios básicos",
        "Suporte por email",
      ],
    },
    {
      category: "official",
      title: "Parceiro Oficial",
      description: "Para empresas em crescimento",
      price: "Desde €2.000/mês",
      isPopular: true,
      features: [
        "Logo destacado na plataforma",
        "Artigos e conteúdo co-branded",
        "Acesso a dados e analytics",
        "Participação em eventos",
        "Suporte prioritário",
        "Newsletter dedicada",
      ],
    },
    {
      category: "premium",
      title: "Parceiro Premium",
      description: "Para grandes corporações",
      price: "Personalizado",
      features: [
        "Posicionamento premium em toda a plataforma",
        "Campanhas exclusivas e personalizadas",
        "Acesso completo a dados e insights",
        "Eventos e activações exclusivas",
        "Gestor de conta dedicado",
        "Integração de API personalizada",
        "Relatórios mensais detalhados",
      ],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategorySelect = (category: string) => {
    setFormData({
      ...formData,
      category: category as "premium" | "official" | "supporter",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000));

    alert("Obrigado pelo seu interesse! Entraremos em contacto em breve.");
    setIsSubmitting(false);

    // Reset form
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      category: "official",
      message: "",
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#21005a] via-[#2b0071] to-[#21005a]">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} size={300} position="top-20 left-10" />
        <FloatingOrb delay={1} size={200} position="top-40 right-20" />
        <FloatingOrb delay={2} size={150} position="bottom-20 left-1/4" />
        <FloatingOrb delay={3} size={250} position="bottom-40 right-1/3" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 pt-32 pb-20">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4 inline-block text-sm font-semibold tracking-wider text-[#00cfb1] uppercase"
              >
                Parceria Estratégica
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 text-5xl font-bold md:text-7xl"
              >
                <span className="text-white">TORNA-TE</span>
                <br />
                <span className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-transparent">
                  NOSSO PARCEIRO
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-[#ba93ff]"
              >
                Junta-te a nós na revolução do futebol amador. Juntos, vamos
                criar oportunidades únicas e transformar paixão em sucesso.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col justify-center gap-4 sm:flex-row"
              >
                <button
                  onClick={() =>
                    document
                      .getElementById("partnership-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] px-8 py-4 font-bold text-[#21005a] transition-all duration-300 hover:scale-105 hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-xl hover:shadow-[#00cfb1]/25"
                >
                  Candidatar-me Agora
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("benefits")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="rounded-full border-2 border-[#00cfb1] px-8 py-4 font-bold text-[#00cfb1] transition-all duration-300 hover:scale-105 hover:bg-[#00cfb1] hover:text-[#21005a]"
                >
                  Ver Benefícios
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Porquê Ser Nosso Parceiro?
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-[#ba93ff]">
                Descubra as vantagens exclusivas de fazer parte do ecossistema
                JogaBola
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <BenefitCard key={index} {...benefit} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Categories */}
        {/* <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-transparent mb-6">
                Escolha o Seu Nível de Parceria
              </h2>
              <p className="text-xl text-[#ba93ff] max-w-3xl mx-auto">
                Temos opções flexíveis para empresas de todos os tamanhos
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {categories.map((cat, index) => (
                <CategoryCard 
                  key={cat.category}
                  {...cat}
                  onSelect={handleCategorySelect}
                  isSelected={formData.category === cat.category}
                />
              ))}
            </div>
          </div>
        </section> */}

        {/* Contact Form */}
        <section id="partnership-form" className="px-4 py-20">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                Vamos Conversar
              </h2>
              <p className="text-xl text-[#ba93ff]">
                Preencha o formulário e entraremos em contacto em 24 horas
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#00cfb1]/20 bg-gradient-to-br from-[#2b0071]/20 to-[#21005a]/20 p-8 backdrop-blur-sm"
            >
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-white">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-[#00cfb1]/30 bg-[#21005a]/50 px-4 py-3 text-white placeholder-[#ba93ff] transition-colors focus:border-[#00cfb1] focus:outline-none"
                    placeholder="Nome da sua empresa"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-semibold text-white">
                    Nome de Contacto *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-[#00cfb1]/30 bg-[#21005a]/50 px-4 py-3 text-white placeholder-[#ba93ff] transition-colors focus:border-[#00cfb1] focus:outline-none"
                    placeholder="O seu nome"
                  />
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-white">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-[#00cfb1]/30 bg-[#21005a]/50 px-4 py-3 text-white placeholder-[#ba93ff] transition-colors focus:border-[#00cfb1] focus:outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-semibold text-white">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#00cfb1]/30 bg-[#21005a]/50 px-4 py-3 text-white placeholder-[#ba93ff] transition-colors focus:border-[#00cfb1] focus:outline-none"
                    placeholder="+351 xxx xxx xxx"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block font-semibold text-white">
                  Website da Empresa
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#00cfb1]/30 bg-[#21005a]/50 px-4 py-3 text-white placeholder-[#ba93ff] transition-colors focus:border-[#00cfb1] focus:outline-none"
                  placeholder="https://www.suaempresa.com"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block font-semibold text-white">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-[#00cfb1]/30 bg-[#21005a]/50 px-4 py-3 text-white placeholder-[#ba93ff] transition-colors focus:border-[#00cfb1] focus:outline-none"
                  placeholder="Conte-nos mais sobre a sua empresa e como podemos trabalhar juntos..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-gradient-to-r from-[#00cfb1] to-[#1effbf] px-8 py-4 font-bold text-[#21005a] transition-all duration-300 hover:from-[#1effbf] hover:to-[#00cfb1] hover:shadow-xl hover:shadow-[#00cfb1]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5 animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  "Enviar Candidatura"
                )}
              </motion.button>
            </motion.form>
          </div>
        </section>
      </div>
    </div>
  );
}
