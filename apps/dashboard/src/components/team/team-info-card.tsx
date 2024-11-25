import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { CalendarDays, Camera, ChevronLeft, ChevronRight } from "@repo/ui/icons";
import noImage from "@/assets/images/JOGABOLA-shield.svg";
import EventCard from "./events-card";
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
		image?: string;
	};
	hasEditPermission: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamData, hasEditPermission }) => {
	return (
		<>
			<div className="relative flex h-full max-h-20 w-full min-w-72 items-center justify-center overflow-hidden rounded border bg-secondary text-white">
				<Marquee pauseOnHover speed={12} applyMask={false}>
					{news?.map((text, index) => (
						<div key={index} className="flex items-center gap-2">
							{text}
							<div className="bg-green-500 rounded-full h-2 w-2 opacity-75 my-auto animate-ping" />
						</div>
					))}
				</Marquee>
			</div>
			<div className="flex items-center justify-between p-2">
				<div className="flex items-center gap-4">
					<div className="relative">
						<Image
							src={teamData.image || noImage}
							alt={teamData.name}
							className="w-32 h-32 rounded-xl object-cover transition-all"
							width={200}
							height={200}
						/>

						{hasEditPermission && (
							<Button variant="ghost" className="absolute hover:bg-gray-50/35 right-0 left-0 bottom-0">
								<Camera className="h-6 w-6 text-gray-600" />
							</Button>
						)}
					</div>

					<div className="text-left">
						<h1 className="text-4xl font-sans text-green-800 mb-2">{teamData.name}</h1>
						<p className="text-gray-600 max-w-md mx-auto">{teamData.bio}</p>
					</div>
				</div>

				<div className="w-full md:w-1/3">
					<Suspense fallback={<div>Loading...</div>}>
						<EventCard />
					</Suspense>
				</div>
			</div>
		</>
	);
};

export default TeamCard;
