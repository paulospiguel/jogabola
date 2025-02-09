import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Users } 
import EditableInput from "../editable-input";
import Counter from "@/components/counter";
import { saveTeamInfo } from "@/actions";
import type { Team } from "@repo/db";
import { formatDate } from "@/utils";

type OverviewTabContentProps = {
  team: Team;
};

export function OverviewTabContent({ team }: OverviewTabContentProps) {
  const handleSaveInfo = async (key: string, value: string) => {
    await saveTeamInfo({
      teamId: team.id,
      input: {
        key,
        value,
      },
    });
  };

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Label className="mr-1">Founded Date:</Label>
              <EditableInput
                type="date"
                initialValue={team?.founded ? formatDate(team?.founded) : ""}
                onSave={value => handleSaveInfo("founded", value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Label className="mr-1">Home Ground:</Label>
              <EditableInput
                initialValue={team?.homeGround || ""}
                onSave={value => handleSaveInfo("homeGround", value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Label className="mr-1">Manager:</Label>
              <EditableInput
                initialValue={team?.manager || ""}
                onSave={value => handleSaveInfo("manager", value)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-start space-x-2">
            <span>Rank Position:</span>
            <span className="font-bold">{team?.position}rd</span>
          </div>
          <div className="flex items-center justify-start space-x-2">
            <span>Matches Played:</span>
            <Counter className="text-md" targetValue={team?.played} />
          </div>
          <div className="flex items-center justify-start space-x-2">
            <span>Goal Difference:</span>
            <span className="font-bold">
              {team?.goalsFor - team?.goalsAgainst}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Season Performance</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-20">Won:</span>
            <Progress
              value={(team?.won / team?.played) * 100}
              className="flex-1"
            />
            <span className="ml-2 w-10 text-right">{team?.won}</span>
          </div>
          <div className="flex items-center">
            <span className="w-20">Drawn:</span>
            <Progress
              value={(team?.drawn / team?.played) * 100}
              className="flex-1"
            />
            <span className="ml-2 w-10 text-right">{team?.drawn}</span>
          </div>
          <div className="flex items-center">
            <span className="w-20">Lost:</span>
            <Progress
              value={(team?.lost / team?.played) * 100}
              className="flex-1"
            />
            <span className="ml-2 w-10 text-right">{team?.lost}</span>
          </div>
        </div>
      </div>
    </>
  );
}
