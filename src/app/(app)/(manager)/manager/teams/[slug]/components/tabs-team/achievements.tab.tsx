import type { Team } from "@repo/db";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } 

type AchievementsTabContentProps = {
  team: Team;
};

export const AchievementsTabContent = ({
  team,
}: AchievementsTabContentProps) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
