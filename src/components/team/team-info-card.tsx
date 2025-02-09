import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Camera } 
import noImage from "@/assets/images/JOGABOLA-shield.svg";
import EventCard from "./events";
import { Suspense } from "react";
import Marquee from "../marquee";

const news = [
  "Última hora: João Silva marca hat-trick na vitória por 3-0 contra o FC Rival! 🎉",
  "Ingressos para o próximo jogo já estão à venda online! 🎟️",
  "Novo patrocinador anunciado para a próxima temporada",
];

interface TeamCardProps {
  teamData: {
    name: string;
    bio: string;
    image: string;
  };
  hasEditPermission?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamData, hasEditPermission }) => {
  return (
    <>
      <div className="relative flex h-full max-h-20 w-full min-w-72 items-center justify-center overflow-hidden rounded border bg-secondary text-white">
        <Marquee pauseOnHover speed={12} applyMask={false}>
          {news?.map((text, index) => (
            <div key={index} className="flex items-center gap-2">
              {text}
              <div className="my-auto h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75" />
            </div>
          ))}
        </Marquee>
      </div>
      <div className="gap-4 md:grid md:grid-cols-6">
        <div className="flex flex-col items-center gap-4 md:col-span-4 md:flex-row">
          <div className="relative">
            <Image
              src={teamData.image || noImage}
              alt={teamData.name}
              className="h-32 w-32 rounded-xl object-cover transition-all"
              width={200}
              height={200}
            />

            {hasEditPermission && (
              <Button
                variant="ghost"
                className="absolute bottom-0 left-0 right-0 hover:bg-gray-50/35"
              >
                <Camera className="h-6 w-6 text-gray-600" />
              </Button>
            )}
          </div>

          <div className="text-center md:text-left">
            <h1 className="mb-2 text-wrap font-sans text-4xl text-green-800">
              {teamData.name}
            </h1>
            <p className="mx-auto max-w-md text-gray-600">{teamData.bio}</p>
          </div>
        </div>

        <div className="relative w-full md:col-span-2">
          <EventCard className="md:absolute" />
        </div>
      </div>
    </>
  );
};

export default TeamCard;
