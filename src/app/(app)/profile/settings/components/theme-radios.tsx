"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";

export const ThemeColorRadios = () => {
  const { theme, setTheme } = useTheme();

  const handleChangeThemeColor = (value: string) => {
    setTheme(value);
  };

  return (
    <RadioGroup
      defaultValue={theme}
      onValueChange={value => {
        handleChangeThemeColor(value);
      }}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="light" id="r1" />
        <Label htmlFor="r1">Light</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="dark" id="r2" />
        <Label htmlFor="r2">Dark</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="system" id="r3" />
        <Label htmlFor="r3">System</Label>
      </div>
    </RadioGroup>
  );
};
