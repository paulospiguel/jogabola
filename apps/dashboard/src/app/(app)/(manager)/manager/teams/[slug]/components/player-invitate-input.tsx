"use client";

import React, { useState, useCallback } from "react";
import { Check, ChevronsUpDown } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { Button } from "@repo/ui/components/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@repo/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";

interface Player {
	id: string;
	name: string;
	ref: string;
	uid: string;
}

async function searchPlayers(query: string): Promise<Player[]> {
	// Replace this with your actual API call
	const response = await fetch(`/api/search-players?q=${encodeURIComponent(query)}`);
	if (!response.ok) {
		throw new Error("Failed to fetch players");
	}
	return response.json();
}

export default function PlayerSearch() {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(false);

	const debouncedSearch = useCallback(
		debounce(async (query: string) => {
			if (query.length < 2) {
				setPlayers([]);
				return;
			}
			setLoading(true);
			try {
				const results = await searchPlayers(query);
				setPlayers(results);
			} catch (error) {
				console.error("Error searching players:", error);
			} finally {
				setLoading(false);
			}
		}, 300),
		[],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className="w-[300px] justify-between">
					{value ? players.find((player) => player.id === value)?.name : "Search players..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0">
				<Command>
					<CommandInput
						placeholder="Search players..."
						onValueChange={(search) => {
							debouncedSearch(search);
						}}
					/>
					<CommandEmpty>{loading ? "Searching..." : "No player found."}</CommandEmpty>
					<CommandGroup>
						{players.map((player) => (
							<CommandItem
								key={player.id}
								value={player.id}
								onSelect={(currentValue) => {
									setValue(currentValue === value ? "" : currentValue);
									setOpen(false);
								}}
							>
								<Check className={cn("mr-2 h-4 w-4", value === player.id ? "opacity-100" : "opacity-0")} />
								{player.name}
								<span className="ml-2 text-sm text-muted-foreground">
									(Ref: {player.ref}, UID: {player.uid})
								</span>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;
	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}
