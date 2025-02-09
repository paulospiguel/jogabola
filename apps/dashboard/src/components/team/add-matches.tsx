"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

import { Calendar } from "@repo/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Checkbox } from "@repo/ui/components/checkbox";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
  CalendarIcon,
  Trophy,
  Users,
  Dumbbell,
  Handshake,
  MapPin,
  Plus,
  Save,
  PlusIcon,
  Trash,
} from "@repo/ui/icons";
import { cn } from "@repo/ui/lib/cn";
import {
  AddOccasionalPlayer,
  type OccationalPlayer,
} from "./add-occasional-player";

// Initial teams data
const initialTeams = [
  "FC Barcelona",
  "Real Madrid",
  "Manchester United",
  "Liverpool",
  "Bayern Munich",
  "Borussia Dortmund",
  "Paris Saint-Germain",
  "Juventus",
  "AC Milan",
  "Ajax",
];

// Mock data for players
const initialPlayers = [
  { id: "1", name: "John Doe", position: "Forward" },
  { id: "2", name: "Jane Smith", position: "Midfielder" },
  { id: "3", name: "Mike Johnson", position: "Defender" },
  { id: "4", name: "Emily Brown", position: "Goalkeeper" },
  { id: "5", name: "Chris Wilson", position: "Forward" },
  { id: "6", name: "Alex Turner", position: "Midfielder" },
  { id: "7", name: "Sam Lee", position: "Defender" },
  { id: "8", name: "Taylor Swift", position: "Forward" },
  { id: "9", name: "Jordan Peterson", position: "Midfielder" },
  { id: "10", name: "Casey Jones", position: "Goalkeeper" },
];

export default function Component() {
  const [teams, setTeams] = useState(initialTeams);
  const [matchDetails, setMatchDetails] = useState({
    opponent: "",
    date: new Date(),
    time: "",
    venue: "",
    location: "",
    matchType: "friendly",
    competition: "",
    convokedPlayers: [],
  });
  const [newTeamName, setNewTeamName] = useState("");
  const [isAddingNewTeam, setIsAddingNewTeam] = useState(false);
  const [isAddOccasionalPlayer, setIsAddOccasionalPlayer] = useState(false);
  const [players, setPlayers] = useState<OccationalPlayer[]>(initialPlayers);
  const handleCreateMatch = () => {
    // Here you would typically send the matchDetails to your backend
    console.log("Match created:", matchDetails);
    // Reset the form
    setMatchDetails({
      opponent: "",
      date: new Date(),
      time: "",
      venue: "",
      location: "",
      matchType: "friendly",
      competition: "",
      convokedPlayers: [],
    });
    setIsAddingNewTeam(false);
    setNewTeamName("");
  };

  const handlePlayerConvocation = (playerId: number | string) => {
    if (playerId === "all") {
      setMatchDetails(prev => ({
        ...prev,
        convokedPlayers:
          prev.convokedPlayers.length === players.length
            ? []
            : players.map(player => player.id),
      }));
      return;
    }

    setMatchDetails(prev => ({
      ...prev,
      convokedPlayers: prev.convokedPlayers.includes(playerId)
        ? prev.convokedPlayers.filter(id => id !== playerId)
        : [...prev.convokedPlayers, playerId],
    }));
  };

  const handleAddNewTeam = () => {
    if (newTeamName && !teams.includes(newTeamName)) {
      setTeams([...teams, newTeamName]);
      setMatchDetails({ ...matchDetails, opponent: newTeamName });
      setNewTeamName("");
      setIsAddingNewTeam(false);
    }
  };

  const handleToggleAddOccasionalPlayer = () => {
    setIsAddOccasionalPlayer(!isAddOccasionalPlayer);
  };

  const handleAddOccasionalPlayer = (player: OccationalPlayer) => {
    //setMatchDetails({ ...matchDetails, convokedPlayers: [...matchDetails.convokedPlayers, player.id] });
    setPlayers(prev => [...prev, player]);

    setIsAddOccasionalPlayer(false);
  };

  const handleDeleteOccasionalPlayer = (playerId: number | string) => {
    setPlayers(prev => prev.filter(player => player.id !== playerId));
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="opponent" className="text-right">
            Opponent
          </Label>
          {isAddingNewTeam ? (
            <div className="col-span-3 flex items-center space-x-2">
              <Input
                id="newTeam"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Enter new team name"
                className="flex-grow"
              />
              <Button onClick={handleAddNewTeam} size="sm">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="col-span-3 flex items-center space-x-2">
              <Select
                value={matchDetails.opponent}
                onValueChange={value =>
                  setMatchDetails({ ...matchDetails, opponent: value })
                }
              >
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Select opponent team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddingNewTeam(true)} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "col-span-3 justify-start text-left font-normal",
                  !matchDetails.date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {matchDetails.date ? (
                  format(matchDetails.date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={matchDetails.date}
                onSelect={date =>
                  date && setMatchDetails({ ...matchDetails, date })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="time" className="text-right">
            Time
          </Label>
          <Input
            id="time"
            type="time"
            value={matchDetails.time}
            onChange={e =>
              setMatchDetails({ ...matchDetails, time: e.target.value })
            }
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="venue" className="text-right">
            Venue
          </Label>
          <Input
            id="venue"
            placeholder="Type of venue"
            value={matchDetails.venue}
            onChange={e =>
              setMatchDetails({ ...matchDetails, venue: e.target.value })
            }
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">
            Location
          </Label>
          <div className="col-span-3 flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              value={matchDetails.location}
              onChange={e =>
                setMatchDetails({ ...matchDetails, location: e.target.value })
              }
              placeholder="City, Country"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Match Type</Label>
          <RadioGroup
            value={matchDetails.matchType}
            onValueChange={value =>
              setMatchDetails({ ...matchDetails, matchType: value })
            }
            className="col-span-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="competition" id="competition" />
              <Label htmlFor="competition">
                <Trophy className="mr-1 inline h-4 w-4" /> Competition
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friendly" id="friendly" />
              <Label htmlFor="friendly">
                <Handshake className="mr-1 inline h-4 w-4" /> Friendly
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="training" id="training" />
              <Label htmlFor="training">
                <Dumbbell className="mr-1 inline h-4 w-4" /> Training
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">
                <Users className="mr-1 inline h-4 w-4" /> Other
              </Label>
            </div>
          </RadioGroup>
        </div>
        {matchDetails.matchType === "competition" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="competition" className="text-right">
              Competition
            </Label>
            <Input
              id="competition"
              value={matchDetails.competition}
              onChange={e =>
                setMatchDetails({
                  ...matchDetails,
                  competition: e.target.value,
                })
              }
              className="col-span-3"
              placeholder="e.g., Champions League, FA Cup"
            />
          </div>
        )}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="pt-2 text-right">Convoke Players</Label>
          <ScrollArea className="col-span-3 h-[200px] rounded-md border p-4">
            <div className="mb-2 flex items-center space-x-2">
              <Checkbox
                id="player-all"
                checked={players.length === matchDetails.convokedPlayers.length}
                onCheckedChange={() => handlePlayerConvocation("all")}
              />
              <Label htmlFor="player-all">All Players</Label>
            </div>
            <hr className="my-2" />
            {players.map(player => (
              <div key={player.id} className="mb-2 flex items-center space-x-2">
                <Checkbox
                  id={`player-${player.id}`}
                  checked={matchDetails.convokedPlayers.includes(player?.id)}
                  onCheckedChange={() => handlePlayerConvocation(player.id)}
                />
                <Label htmlFor={`player-${player.id}`}>
                  {player.name} - {player.position}
                </Label>

                {player?.id?.startsWith("new") && (
                  <button
                    type="button"
                    className="p-0 hover:text-red-500"
                    onClick={() => handleDeleteOccasionalPlayer(player.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <AddOccasionalPlayer
              className="my-4"
              handleAddOccasionalPlayer={handleAddOccasionalPlayer}
              isAddOccasionalPlayer={isAddOccasionalPlayer}
              handleToggleAddOccasionalPlayer={handleToggleAddOccasionalPlayer}
            />
            <hr className="my-2" />
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>GoalKeaper: 2/3</span>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Midfielder: 2/3</span>
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Defender: 2/3</span>
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <span>Forward: 2/3</span>
              <span className="rounded-full bg-primary px-2 text-white">
                Convoked: 2/22
              </span>
            </div>
          </ScrollArea>
        </div>
      </div>

      <Button onClick={handleCreateMatch}>Save Match</Button>
    </>
  );
}
