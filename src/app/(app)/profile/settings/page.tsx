import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ThemeColorRadios } from "./components/theme-radios";
import LanguageSelector from "@/components/language-selector";

export default async function ProfileSettings() {
  return (
    <Card x-chunk="dashboard-04-chunk-1">
      <CardHeader> </CardHeader>
      <CardContent className="grid grid-cols-4 gap-4">
        <div className="">
          <h1 className="mb-2 text-xl font-semibold">Thema de cores</h1>
          <ThemeColorRadios />
        </div>
        <div className="">
          <h1 className="mb-2 text-xl font-semibold">Idioma</h1>
          <LanguageSelector />
        </div>
      </CardContent>
    </Card>
  );
}
