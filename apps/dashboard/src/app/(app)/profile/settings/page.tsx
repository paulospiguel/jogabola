import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { ThemeColorRadios } from "./components/theme-radios";
import LanguageSelector from "@/components/language-selector";

export default async function ProfileSettings() {
	return (
		<Card x-chunk="dashboard-04-chunk-1">
			<CardHeader> </CardHeader>
			<CardContent className="grid grid-cols-4 gap-4">
				<div className="">
					<h1 className="text-xl font-semibold mb-2">Thema de cores</h1>
					<ThemeColorRadios />
				</div>
				<div className="">
					<h1 className="text-xl font-semibold mb-2">Idioma</h1>
					<LanguageSelector />
				</div>
			</CardContent>
		</Card>
	);
}
