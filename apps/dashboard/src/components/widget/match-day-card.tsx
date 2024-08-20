import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, CloudSun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type NextMeetingCardProps = {
	teamA: string;
	teamB: string;
};

export default function MetchDayCard({ teamA, teamB }: NextMeetingCardProps) {
	return (
		<Card className="flex-grow w-full">
			<CardHeader className="text-center p-4">
				<div className="flex flex-col items-center justify-between">
					<h1 className="text-xl self-start ">Next Metting</h1>
					<div className="flex items-center gap-2">
						<TeamLogo image={teamA} />
						<div className="font-bold">VS</div>
						<TeamLogo image={teamB} />
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="flex items-center justify-between">
					<div className="grid gap-1">
						<div className="text-sm font-medium">Data</div>
						<div className="text-base font-bold">25 de Agosto, 2023</div>
					</div>
					<div className="grid gap-1">
						<div className="text-sm font-medium">Hora</div>
						<div className="text-base font-bold">19:00</div>
					</div>
					<div className="grid gap-1">
						<div className="text-sm font-medium">Local</div>
						<div className="text-base font-bold">Café Central</div>
					</div>
				</div>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<CloudSun className="w-6 h-6" />
						<div className="text-sm font-medium">Ensolarado</div>
					</div>
					<Link
						href="#"
						className="flex items-center gap-2 text-sm font-medium underline underline-offset-2"
						prefetch={false}
					>
						<Clock className="w-4 h-4" />
						Ver Histórico
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

const TeamLogo = ({ image }: { image: string }) => {
	return <Image className="object-cover rounded-xl" src={image} alt="" width={58} height={58} />;
};
