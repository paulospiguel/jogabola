import { Concert_One, Fira_Sans, Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fontBody = Fira_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-body",
});
const consertOne = Concert_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-concert-one",
});
const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fire-sans",
});

export const fonts = [consertOne, inter, fontBody, firaSans]
  .map(font => font.variable)
  .join(" ");
