import { LucideIcon } from "lucide-react";
import { StaticImageData } from "next/image";

export interface OnboardFormData {
  role: string;
  name: string;
  email: string;
  location: string;
  experience: string;
  goals: string[];
  availability: string;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    earlyAccess: boolean;
  };
  waitlistApps: string[];
}

export interface JourneyOption {
  id: string;
  title: string;
  tags: string[];
  icon: StaticImageData;
  color: string;
  features: string[];
}

export interface WaitlistApp {
  id: string;
  name: string;
  description: string;
  status: "beta" | "coming-soon";
  estimatedLaunch: string;
}

export interface Goal {
  id: string;
  label: string;
  icon: LucideIcon;
}
