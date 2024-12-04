import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

const mobilePrefixes = [
  { value: "+351", label: "🇵🇹 +351" },
  { value: "+55", label: "🇧🇷 +55" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+33", label: "🇫🇷 +33" },
] as const;

export const LoginMobile = () => {
  const mobilePrefixeValue = mobilePrefixes[0].value;
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center">
      <div className="flex w-full">
        <Select defaultValue={mobilePrefixeValue}>
          <SelectTrigger className="w-[180px] rounded-r-none">
            <SelectValue placeholder="Mobile country" />
          </SelectTrigger>
          <SelectContent>
            {mobilePrefixes.map(prefix => (
              <SelectItem key={prefix.value} value={prefix.value}>
                {prefix.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          placeholder="Mobile number"
          className="rounded-l-none"
        />
      </div>
      <Button variant={"default"} className="mt-2 w-full rounded-full">
        <span>Send OTP</span>
      </Button>
    </div>
  );
};
