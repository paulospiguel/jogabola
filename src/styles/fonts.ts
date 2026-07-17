import {
  Bebas_Neue,
  Concert_One,
  Fira_Sans,
  Inter,
  Sora,
} from "next/font/google";

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

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-sora",
});

export const fonts = [consertOne, inter, fontBody, firaSans, bebasNeue, sora]
  .map(font => font.variable)
  .join(" ");
