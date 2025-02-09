"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDaysIcon, ClockIcon } 
import { TextareaMention } from "../textarea-mention";
import { useState } from "react";

export default function AddNewCompetition() {
  const suggestedData = [
    {
      id: "match",
      display: "Match",
    },
    {
      id: "training",
      display: "Training Session",
    },
    {
      id: "meeting",
      display: "Team Meeting",
    },
    {
      id: "social",
      display: "Social Event",
    },
  ];

  const [value, onChange] = useState("");

  return (
    <Card className="max-w-7xl border-none shadow-none">
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
        <CardDescription>
          Add a new event for your football team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="training">Training Session</SelectItem>
                <SelectItem value="meeting">Team Meeting</SelectItem>
                <SelectItem value="social">Social Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                >
                  <CalendarDaysIcon className="mr-2 h-4 w-4" />
                  Pick a date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Start time
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    <ClockIcon className="mr-2 h-4 w-4" />
                    End time
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Enter location" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Provide details about the event"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mention">Mention</Label>
          <TextareaMention
            value={value}
            onChange={ev => onChange(ev.target.value)}
            data={suggestedData}
            onAdd={() => {}}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button type="submit">Create Event</Button>
      </CardFooter>
    </Card>
  );
}
