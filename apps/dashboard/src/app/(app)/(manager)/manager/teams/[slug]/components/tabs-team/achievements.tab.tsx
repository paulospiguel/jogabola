import type { Team } from "@repo/db";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Trophy } from "@repo/ui/icons";

type AchievementsTabContentProps = {
	team: Team;
};

export const AchievementsTabContent = ({ team }: AchievementsTabContentProps) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
			{team?.cups?.map((cup, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center space-x-4 pb-2">
						<Avatar>
							<AvatarImage src={cup.image} alt={cup.name} />
							<AvatarFallback>
								<Trophy />
							</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle>{cup.name}</CardTitle>
							<CardDescription>{cup.year}</CardDescription>
						</div>
					</CardHeader>
				</Card>
			))}
		</div>
	);
};
