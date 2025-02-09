import type { Team } from "@repo/db";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

type PlayersTabContentProps = {
  team: Team;
};
export const PlayersTabContent = ({ team }: PlayersTabContentProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Number</TableHead>
          <TableHead>Nationality</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Appearances</TableHead>
          <TableHead>Goals</TableHead>
          <TableHead>Assists</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {team?.players?.map(player => (
          <TableRow key={player.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.image} alt={player.name} />
                  <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span>{player.name}</span>
              </div>
            </TableCell>
            <TableCell>{player.position}</TableCell>
            <TableCell>{player.number}</TableCell>
            <TableCell>{player.nationality}</TableCell>
            <TableCell>{player.age}</TableCell>
            <TableCell>{player.appearances}</TableCell>
            <TableCell>{player.goals}</TableCell>
            <TableCell>{player.assists}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
