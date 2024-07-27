import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FormEventHandler } from "react";
import { ThemeColorRadios } from "./components/theme-radios";

export default async function ProfileSettings() {
	return (
		<Card x-chunk="dashboard-04-chunk-1">
			<CardHeader> </CardHeader>
			<CardContent>
				<div>
					<h1 className="text-xl font-semibold mb-2">Thema de cores</h1>
					<ThemeColorRadios />
				</div>
			</CardContent>
		</Card>
	);
}
