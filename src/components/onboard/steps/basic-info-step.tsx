"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardStepHeader } from "@/components/onboard-step-header";
import { motion } from "framer-motion";

interface BasicInfoStepProps {
  name: string;
  email: string;
  location: string;
  autoFilledFields: {
    name?: boolean;
    email?: boolean;
  };
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export function BasicInfoStep({
  name,
  email,
  location,
  autoFilledFields,
  onNameChange,
  onEmailChange,
  onLocationChange,
}: BasicInfoStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <OnboardStepHeader
        title="Informações Básicas"
        description="Vamos começar com as tuas informações essenciais."
      />

      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <Label htmlFor="name" className="font-medium text-white">
            Nome Completo *
          </Label>
          <Input
            id="name"
            value={name}
            onChange={e => {
              if (autoFilledFields.name) return;
              onNameChange(e.target.value);
            }}
            placeholder="O teu nome"
            disabled={!!autoFilledFields.name}
            className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60 disabled:cursor-not-allowed disabled:opacity-60"
          />
          {autoFilledFields.name && (
            <p className="mt-1 text-xs text-white/60">
              Este campo foi preenchido automaticamente com os dados da tua
              conta.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="font-medium text-white">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => {
              if (autoFilledFields.email) return;
              onEmailChange(e.target.value);
            }}
            placeholder="teu@email.com"
            disabled={!!autoFilledFields.email}
            className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60 disabled:cursor-not-allowed disabled:opacity-60"
          />
          {autoFilledFields.email && (
            <p className="mt-1 text-xs text-white/60">
              Este campo foi preenchido automaticamente com os dados da tua
              conta.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="location" className="font-medium text-white">
            Localização
          </Label>
          <Input
            id="location"
            value={location}
            onChange={e => onLocationChange(e.target.value)}
            placeholder="Cidade, País"
            className="mt-2 border-white/20 bg-white/10 text-white placeholder:text-white/60"
          />
          <p className="mt-1 text-xs text-white/60">
            Ajuda-nos a mostrar eventos e equipas perto de ti
          </p>
        </div>
      </div>
    </motion.div>
  );
}

