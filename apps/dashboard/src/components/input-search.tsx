"use client";

import { Input } from "@repo/ui/components/input";
import { Search } from "@repo/ui/icons";

export const InputSearch = () => {
	return (
		<form className="flex-1 mx-auto w-full sm:flex-initial max-w-screen px-4">
			<div className="relative">
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Pesquisa..."
					className="pl-8 sm:w-[300px] md:w-[200px] lg:w-full rounded-full"
				/>
			</div>
		</form>
	);
};
