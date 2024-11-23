import Image from "next/image";
import { Button } from "@repo/ui/components/button";
import { CalendarDays, Camera, ChevronLeft, ChevronRight } from "@repo/ui/icons";
import noImage from "@/assets/images/JOGABOLA-shield.svg";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import EventCard from "./events-card";
import { Suspense } from "react";

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
		<div className="flex items-center justify-between p-2">
			<div className="flex items-center gap-4">
				<div className="relative">
					<Image
						src={teamData.image || noImage}
						alt={teamData.name}
						className="w-32 h-32 rounded-xl object-cover"
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
	);
};

export default TeamCard;
