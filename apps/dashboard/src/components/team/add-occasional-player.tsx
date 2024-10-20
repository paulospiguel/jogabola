import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { PlusIcon, Save } from "@repo/ui/icons";
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
	const [player, setPlayer] = useState<OccationalPlayer>({} as OccationalPlayer);

	const handleInputName = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPlayer({ ...player, name: event.target.value, id: `new-${Date.now()}` });
	};

	return (
		<div className={className}>
			{isAddOccasionalPlayer ? (
				<div className="flex space-x-2 px-2 my-4">
					<div className="flex items-center gap-2 w-full">
						<Input type="text" className="w-full" placeholder="Type Name of Player" onChange={handleInputName} />
						<Select value={player?.position} onValueChange={(value) => setPlayer({ ...player, position: value })}>
							<SelectTrigger className="flex-grow">
								<SelectValue placeholder="Select Position" />
							</SelectTrigger>
							<SelectContent>
								{playerPositions?.map((team) => (
									<SelectItem key={team} value={team}>
										{team}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button className="bg-primary text-white" variant="outline" onClick={() => handleAddOccasionalPlayer(player)}>
						<Save className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<Button className="" variant="outline" onClick={handleToggleAddOccasionalPlayer}>
					<PlusIcon className="mr-2 h-4 w-4" />
					Add Occasional Player
				</Button>
			)}
		</div>
	);
};
