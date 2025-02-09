import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, Save } 
import { useState } from "react";

const playerPositions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export type OccationalPlayer = {
  id: string;
  name: string;
  position: string;
};

type AddOccasionalPlayerProps = {
  handleAddOccasionalPlayer: (player: OccationalPlayer) => void;
  handleToggleAddOccasionalPlayer: () => void;
  isAddOccasionalPlayer: boolean;
  className?: string;
};

export const AddOccasionalPlayer = ({
  isAddOccasionalPlayer,
  handleAddOccasionalPlayer,
  handleToggleAddOccasionalPlayer,
  className,
}: AddOccasionalPlayerProps) => {
  const [player, setPlayer] = useState<OccationalPlayer>(
    {} as OccationalPlayer,
  );

  const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer({ ...player, name: event.target.value, id: `new-${Date.now()}` });
  };

  return (
    <div className={className}>
      {isAddOccasionalPlayer ? (
        <div className="my-4 flex space-x-2 px-2">
          <div className="flex w-full items-center gap-2">
            <Input
              type="text"
              className="w-full"
              placeholder="Type Name of Player"
              onChange={handleInputName}
            />
            <Select
              value={player?.position}
              onValueChange={value => setPlayer({ ...player, position: value })}
            >
              <SelectTrigger className="flex-grow">
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                {playerPositions?.map(team => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-primary text-white"
            variant="outline"
            onClick={() => handleAddOccasionalPlayer(player)}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          className=""
          variant="outline"
          onClick={handleToggleAddOccasionalPlayer}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Occasional Player
        </Button>
      )}
    </div>
  );
};
