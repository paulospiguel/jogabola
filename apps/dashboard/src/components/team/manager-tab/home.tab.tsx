import type { Session } from "next-auth";

import { CardCarousel } from "@/components/card-carousel";
import Counter from "@/components/counter";
import GaugeChart from "@/components/graphs/gauge-chart";
import RingChart from "@/components/graphs/ring-chart";
import PlayerList from "@/components/player-list";
import { StatCard } from "@/components/stat-card";
import Ticker from "@/components/ticker";
import NextMeetingCard from "@/components/widget/match-day-card";
import MonthScoreWidget from "@/components/widget/month-status";
import ScheduleEventWidget from "@/components/widget/schedule-events";
import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import GameSchedule from "../game-schedule";
import WrapperLayoutTab from "./wrapper-layout.tab";

interface HomeProps {
	tabKey: string;
	session: Session | null;
}

import teamA from "../../../../public/temp/barreiro.jpg";
import teamB from "../../../../public/temp/bolacacem.jpg";

export default function HomeTabContent({ tabKey, session }: HomeProps) {
	return (
		<WrapperLayoutTab tabKey={tabKey} className="space-y-4">
			<div className="grid grid-cols-3 gap-2">
				<StatCard>
					<div className="font-bold text-yellow-700">Highly rated</div>
					<div className="mt-auto flex justify-end">
						<div className="text-4xl font-black text-black/60 md:text-7xl">
							<Ticker value="4.8" />
						</div>
						<sup className="text-xl text-yellow-700">★</sup>
					</div>
				</StatCard>

				<StatCard className="flex flex-col flex-grow justify-between">
					<Counter className="text-yellow-700 text-2xl" targetValue={179} suffix=" Players" />
					<PlayerList size="sm" className="py-0 self-end" />
				</StatCard>

				<CardCarousel
					showControls
					classNameControls="absolute mx-auto inset-x-0 bottom-3"
					items={[
						<NextMeetingCard key="nextMetting" teamA={teamA} teamB={teamB} />,
						<ScheduleEventWidget key="schedule" dates={undefined} />,
						<MonthScoreWidget key="monthScore" items={undefined} />,
					]}
				/>
			</div>
			<div className="gap-2 w-full grid grid-cols-3 justify-stretch">
				<CardCarousel showControls items={[<GameSchedule key="calendar" />]} />

				<Card className="shadow-md flex flex-col justify-center">
					<CardContent className="flex justify-center gap-4">
						<GaugeChart
							color="success"
							circleWidth={10}
							gap={100}
							progress={70}
							progressWidth={10}
							rounded
							showValue
							size={180}
						/>
						<GaugeChart
							color="danger"
							circleWidth={10}
							gap={100}
							progress={10}
							progressWidth={10}
							rounded
							showValue
							size={150}
						/>
					</CardContent>
					<CardFooter className="items-center justify-center">Wins/Losses</CardFooter>
				</Card>
				<Card className="shadow-md">
					<CardContent>
						<RingChart
							size={100}
							text="Good"
							textColor="success"
							rings={[
								{
									progress: 60,
									progressClassName: "text-lime-600",
									trackClassName: "text-gray-500/20",
								},
								{
									progress: 30,
									progressClassName: "text-blue-500",
									trackClassName: "text-gray-500/20",
								},
								{
									progress: 10,
									progressClassName: "text-red-400",
									trackClassName: "text-gray-500/20",
								},
							]}
						/>
					</CardContent>
					<CardFooter className="items-center justify-center">Performance</CardFooter>
				</Card>
			</div>
		</WrapperLayoutTab>
	);
}
