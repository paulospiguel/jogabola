import {
  EVENT_PAYMENT_STATUS,
  type EventPaymentStatus,
} from "@/constants/event-payment-status";

export interface EventRosterPlayer {
  id: string;
  name: string;
  pos: string;
  rating: number;
  status: EventPaymentStatus;
  verified: boolean;
  star: boolean;
  initials: string;
  color: string;
}

export interface EventChatMessage {
  id: number;
  name: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  self: boolean;
}

export const MAIN_ROSTER: EventRosterPlayer[] = [
  {
    id: "1",
    name: "Diogo Ferreira",
    pos: "GR",
    rating: 8.2,
    status: EVENT_PAYMENT_STATUS.PAID,
    verified: true,
    star: true,
    initials: "DF",
    color: "#FACC15",
  },
  {
    id: "2",
    name: "André Costa",
    pos: "DD",
    rating: 7.5,
    status: EVENT_PAYMENT_STATUS.PAID,
    verified: true,
    star: false,
    initials: "AC",
    color: "#38BDF8",
  },
  {
    id: "3",
    name: "Tiago Mendes",
    pos: "DC",
    rating: 7.8,
    status: EVENT_PAYMENT_STATUS.REVIEW,
    verified: true,
    star: false,
    initials: "TM",
    color: "#EF4444",
  },
  {
    id: "4",
    name: "Bruno Alves",
    pos: "DC",
    rating: 8.0,
    status: EVENT_PAYMENT_STATUS.PENDING,
    verified: true,
    star: false,
    initials: "BA",
    color: "#22C55E",
  },
  {
    id: "5",
    name: "Ricardo Pinto",
    pos: "DE",
    rating: 8.5,
    status: EVENT_PAYMENT_STATUS.PAID,
    verified: true,
    star: true,
    initials: "RP",
    color: "#B97FFF",
  },
  {
    id: "6",
    name: "Fábio Rodrigues",
    pos: "MC",
    rating: 7.2,
    status: EVENT_PAYMENT_STATUS.PENDING,
    verified: false,
    star: false,
    initials: "FR",
    color: "#3B82F6",
  },
  {
    id: "7",
    name: "Nuno Santos",
    pos: "MC",
    rating: 7.9,
    status: EVENT_PAYMENT_STATUS.PAID,
    verified: true,
    star: false,
    initials: "NS",
    color: "#F97316",
  },
  {
    id: "8",
    name: "Carlos Sousa",
    pos: "ME",
    rating: 7.3,
    status: EVENT_PAYMENT_STATUS.PENDING,
    verified: false,
    star: false,
    initials: "CS",
    color: "#EC4899",
  },
  {
    id: "9",
    name: "Rui Gomes",
    pos: "CA",
    rating: 8.3,
    status: EVENT_PAYMENT_STATUS.PAID,
    verified: true,
    star: false,
    initials: "RG",
    color: "#7CFF4F",
  },
  {
    id: "10",
    name: "Marco Carvalho",
    pos: "GR",
    rating: 7.4,
    status: EVENT_PAYMENT_STATUS.REVIEW,
    verified: true,
    star: false,
    initials: "MC",
    color: "#14B8A6",
  },
];

export const RESERVES_ROSTER: EventRosterPlayer[] = [
  {
    id: "11",
    name: "João Martins",
    pos: "MD",
    rating: 7.0,
    status: EVENT_PAYMENT_STATUS.RESERVE,
    verified: true,
    star: false,
    initials: "JM",
    color: "#6366F1",
  },
  {
    id: "12",
    name: "Luís Oliveira",
    pos: "PD",
    rating: 7.6,
    status: EVENT_PAYMENT_STATUS.RESERVE,
    verified: true,
    star: false,
    initials: "LO",
    color: "#8B5CF6",
  },
  {
    id: "13",
    name: "Miguel Pereira",
    pos: "PE",
    rating: 6.8,
    status: EVENT_PAYMENT_STATUS.PENDING,
    verified: true,
    star: false,
    initials: "MP",
    color: "#A855F7",
  },
  {
    id: "14",
    name: "Sérgio Lima",
    pos: "DC",
    rating: 7.1,
    status: EVENT_PAYMENT_STATUS.PENDING,
    verified: false,
    star: false,
    initials: "SL",
    color: "#6B7280",
  },
];

export const INITIAL_CHAT_MESSAGES: EventChatMessage[] = [
  {
    id: 1,
    name: "Diogo Ferreira",
    initials: "DF",
    color: "#FACC15",
    text: "Quem leva as bolas para o treino?",
    time: "20:05",
    self: false,
  },
  {
    id: 2,
    name: "André Costa",
    initials: "AC",
    color: "#38BDF8",
    text: "Eu levo uma, mas precisamos de pelo menos mais outra.",
    time: "20:08",
    self: false,
  },
  {
    id: 3,
    name: "Tiago Mendes",
    initials: "TM",
    color: "#EF4444",
    text: "Eu posso levar a bomba de ar por via das dúvidas.",
    time: "20:12",
    self: false,
  },
  {
    id: 4,
    name: "Ricardo Pinto",
    initials: "RP",
    color: "#B97FFF",
    text: "Já me inscrevi! Contem comigo no Campo 3.",
    time: "20:15",
    self: false,
  },
];

export const CURRENT_CHAT_USER = {
  name: "Rui Gomes",
  initials: "RG",
  color: "#7CFF4F",
} as const;
