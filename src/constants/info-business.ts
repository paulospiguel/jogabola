import {
  LuActivity,
  LuCalendarCheck,
  LuDribbble,
  LuHeart,
  LuMap,
  LuSmile,
  LuTrophy,
  LuUsers,
} from "react-icons/lu";

export const infoBusiness = {
  name: "business.name",
  slogan: "business.slogan",
  shortDescription: "business.shortDescription",
  longDescription: "business.longDescription",

  mission: "business.mission",
  vision: "business.vision",
  values: [
    {
      title: "business.values.passion.title",
      description: "business.values.passion.description",
      icon: LuHeart,
    },
    {
      title: "business.values.accessibility.title",
      description: "business.values.accessibility.description",
      icon: LuUsers,
    },
    {
      title: "business.values.community.title",
      description: "business.values.community.description",
      icon: LuSmile,
    },
    {
      title: "business.values.innovation.title",
      description: "business.values.innovation.description",
      icon: LuActivity,
    },
  ],

  benefits: [
    {
      title: "business.benefits.findNearby.title",
      description: "business.benefits.findNearby.description",
      icon: LuMap,
    },
    {
      title: "business.benefits.reserveFields.title",
      description: "business.benefits.reserveFields.description",
      icon: LuCalendarCheck,
    },
    {
      title: "business.benefits.joinTournaments.title",
      description: "business.benefits.joinTournaments.description",
      icon: LuTrophy,
    },
    {
      title: "business.benefits.connectPlayers.title",
      description: "business.benefits.connectPlayers.description",
      icon: LuDribbble,
    },
  ],

  foundingYear: 2024,

  team: [
    {
      name: "business.team.paulo.name",
      role: "business.team.paulo.role",
      bio: "business.team.paulo.bio",
      image: "https://github.com/paulospiguel.png",
    },
  ],

  socialMedia: {
    instagram: "https://instagram.com/jogabola.app",
    twitter: "https://twitter.com/jogabola",
    facebook: "https://facebook.com/jogabola.app",
    linkedin: "https://linkedin.com/in/paulo-spiguel/",
    youtube: "https://youtube.com/jogabola.app",
  },

  contact: {
    email: "contato@jogabola.app",
    phone: "+55 xxx xxx xxx",
  },
};
