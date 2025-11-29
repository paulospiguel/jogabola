"use client";

import { BackgroundBeamsWithCollision } from "@/components/background-beams-with-collision";
import { Text } from "@/components/ui/Text";
import { infoBusiness } from "@/constants/info-business";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { LuCalendarClock, LuMail } from "react-icons/lu";
import Beam from "./beam";

export default function AboutPage() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const yearsActive = currentYear - infoBusiness.foundingYear;

  return (
    <div className="container mx-auto space-y-4 px-4 py-12">
      <BackgroundBeamsWithCollision className="flex flex-col">
        <h2 className="relative z-10 text-center font-sans text-2xl font-bold tracking-tight text-black md:text-4xl lg:text-7xl dark:text-white">
          <Text variant="h1" className="text-black">
            {t("about.title")}
          </Text>
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="relative bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 bg-clip-text bg-no-repeat py-4 text-transparent">
              <span className="text-4xl">{infoBusiness.slogan}</span>
            </div>
          </div>
        </h2>

        {/* Seção Principal */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Text variant="h3" className="mx-auto mb-8 max-w-3xl">
              {infoBusiness.shortDescription}
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 p-8 text-white"
          >
            <div className="mx-auto max-w-3xl">
              <Text variant="lead" className="leading-relaxed text-white">
                {infoBusiness.longDescription}
              </Text>
            </div>
          </motion.div>
        </section>
      </BackgroundBeamsWithCollision>

      {/* Missão, Visão e Valores */}
      <section className="mb-16">
        <Text variant="h2" fontWeight="bold" className="mb-8 text-center">
          {t("about.mission_vision_values")}
        </Text>

        <div className="mb-12 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-background/60 rounded-xl border-2 p-6 shadow-sm"
          >
            <Text variant="h3" fontWeight="bold" className="mb-3 text-center">
              {t("about.mission")}
            </Text>
            <Text variant="lead">{infoBusiness.mission}</Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-background/60 rounded-xl border-2 p-6 shadow-sm"
          >
            <Text variant="h3" fontWeight="bold" className="mb-3">
              {t("about.vision")}
            </Text>
            <Text variant="lead">{infoBusiness.vision}</Text>
          </motion.div>
        </div>

        <Text variant="h3" fontWeight="bold" className="mb-6 text-center">
          {t("about.values")}
        </Text>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {infoBusiness.values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-background/60 rounded-xl border-2 p-6 text-center shadow-sm"
            >
              <value.icon className="mx-auto mb-4 h-12 w-12 text-teal-500" />
              <Text variant="h4" fontWeight="bold" className="mb-2">
                {value.title}
              </Text>
              <Text variant="small" className="text-sm">
                {value.description}
              </Text>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="mb-16 rounded-xl bg-teal-50 px-4 py-12 dark:bg-slate-800/30">
        <Text variant="h2" fontWeight="bold" className="mb-8 text-center">
          {t("about.benefits")}
        </Text>

        <div className="grid gap-8 md:grid-cols-2">
          {infoBusiness.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex items-start gap-4 p-4"
            >
              <div className="rounded-full bg-teal-500 p-3 text-white">
                <benefit.icon className="h-6 w-6" />
              </div>
              <div>
                <Text variant="h4" fontWeight="bold" className="mb-2">
                  {benefit.title}
                </Text>
                <Text variant="muted" fontSize="md">
                  {benefit.description}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Equipe */}
      <section className="mb-16">
        <Text variant="h2" fontWeight="bold" className="mb-8 text-center">
          {t("about.team")}
        </Text>

        <div className="flex flex-wrap justify-center gap-8">
          {infoBusiness.team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-xs text-center"
            >
              <div className="relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full border-4 border-teal-500">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-full"
                />
              </div>
              <Text variant="h4" fontWeight="bold" className="mb-1">
                {member.name}
              </Text>
              <Text
                variant="muted"
                className="mb-2 text-teal-600 dark:text-teal-400"
              >
                {member.role}
              </Text>
              <Text variant="small" className="text-sm">
                {member.bio}
              </Text>
            </motion.div>
          ))}
        </div>
      </section>

      {/* História e Estatísticas */}
      <section className="mb-16 grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Text variant="h2" fontWeight="bold" className="mb-6">
            {t("about.history")}
          </Text>
          <Text variant="lead" className="mb-4">
            {t("about.history_text", {
              year: infoBusiness.foundingYear,
              name: infoBusiness.name,
            })}
          </Text>
          <div className="mb-2 flex items-center gap-3">
            <LuCalendarClock className="h-5 w-5 text-teal-500" />
            <Text variant="muted">
              {t("about.history_operating", { years: yearsActive })}
            </Text>
          </div>
        </motion.div>

        <Beam />

        {/* <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-xl bg-blue-500 p-8 text-white"
        >
          <Text variant="h3" fontWeight="bold" className="mb-6 text-center">
            {t("about.statistics")}
          </Text>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <Text
                variant="h2"
                fontWeight="bold"
                className="text-4xl md:text-5xl"
              >
                1500+
              </Text>
              <Text variant="muted" className="text-blue-100">
                {t("about.statistics_users")}
              </Text>
            </div>
            <div className="text-center">
              <Text
                variant="h2"
                fontWeight="bold"
                className="text-4xl md:text-5xl"
              >
                300+
              </Text>
              <Text variant="muted" className="text-blue-100">
                {t("about.statistics_fields")}
              </Text>
            </div>
            <div className="text-center">
              <Text
                variant="h2"
                fontWeight="bold"
                className="text-4xl md:text-5xl"
              >
                5000+
              </Text>
              <Text variant="muted" className="text-blue-100">
                {t("about.statistics_games")}
              </Text>
            </div>
            <div className="text-center">
              <Text
                variant="h2"
                fontWeight="bold"
                className="text-4xl md:text-5xl"
              >
                50+
              </Text>
              <Text variant="muted" className="text-blue-100">
                {t("about.statistics_cities")}
              </Text>
            </div>
          </div>
        </motion.div> */}
      </section>

      {/* Contato e Redes Sociais */}
      <section className="mb-8 text-center">
        <Text variant="h2" fontWeight="bold" className="mb-6">
          {t("about.contact")}
        </Text>

        <div className="mb-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <motion.a
            href={`mailto:${infoBusiness.contact.email}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-teal-100 px-4 py-3 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
          >
            <LuMail className="h-5 w-5" />
            <span>{infoBusiness.contact.email}</span>
          </motion.a>
          {/* <motion.a
            href={`tel:${infoBusiness.contact.phone}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-3 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
          >
            <LuPhone className="h-5 w-5" />
            <span>{infoBusiness.contact.phone}</span>
          </motion.a> */}
        </div>

        <Text variant="h3" className="mb-4">
          {t("about.follow_us")}
        </Text>
        <div className="flex justify-center gap-4">
          <motion.a
            href={infoBusiness.socialMedia.instagram}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-3 text-white"
          >
            <FaInstagram className="h-6 w-6" />
          </motion.a>
          <motion.a
            href={infoBusiness.socialMedia.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-blue-500 p-3 text-white"
          >
            <FaLinkedin className="h-6 w-6" />
          </motion.a>
          <motion.a
            href={infoBusiness.socialMedia.youtube}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-red-600 p-3 text-white"
          >
            <FaYoutube className="h-6 w-6" />
          </motion.a>
        </div>
      </section>
    </div>
  );
}
